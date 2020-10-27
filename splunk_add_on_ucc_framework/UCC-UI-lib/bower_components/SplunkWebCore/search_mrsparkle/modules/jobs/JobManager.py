# SPDX-FileCopyrightText: 2020 2020
#
# SPDX-License-Identifier: Apache-2.0

import cherrypy
import logging
import controllers.module as module
import splunk
import datetime
from splunk.appserver.mrsparkle.lib import i18n, util, decorators
import splunk.entity
import splunk.util
import splunk.search.TransformerUtil as TransformerUtil 

logger = logging.getLogger('splunk.modules.job_manager')

# This duplicates a controller/view.py setting which could not
# be imported.
DEFAULT_DISPLAYVIEW = 'search'

class JobManager(module.ModuleHandler):
    
    APPS_KEY = 'app'
    VIEW_KEY = 'ui_dispatch_view'
    EPOCH_TIME = "1969-12-31T16:00:00.000-08:00"
    
    @decorators.set_cache_level('never')
    def generateResults(self, count=10, offset=0, sortKey='createTime', sortDir='desc', sid=None, search=None, jobStatus=None, user=None, app=None, label=None, **kw):
        '''
        Returns an html fragment or json string depending on the incoming request params.
        Adds some extra properties onto each job dictionary representation.
        '''

        # TRANS: String representation of job states
        def getJobStatusString(job):
            if job.get('isFinalized'): return _('Finalized')
            if job.get('isDone'): return _('Done')
            if job.get('isPaused'): return _('Paused')
            if job.get('dispatchState') == 'QUEUED': return _('Queued')
            return _("Running (%.0f%%)" % (float(job.get('doneProgress', 0)) * 100.0))

        # TRANS String representation of the job's expires time
        def getJobExpiresString(job, tz):
            if job.get('isSaved'): return _('Saved')
            elif job.get('ttl') != None and job.get('ttl') < 0: return _('Expired')
            else:
                delta = datetime.timedelta(seconds=job.get('ttl'))
                now = datetime.datetime.now(tz)
                future = now + delta
                return i18n.format_datetime(future)

        def getJobApp(job):
            if 'eai:acl' in job and self.APPS_KEY in job['eai:acl']:
                return job['eai:acl'][self.APPS_KEY]
            return ''

        savedSearchViews = {}
        def getJobURI(job):
            sid = job.get('sid')
            app = getJobApp(job)
            view = None

            if job.get('request'):
                view = job.get('request').get(self.VIEW_KEY)

            # First see if we have all the necessary view data
            if sid != None and app != None and view != None:
                return self.controller.make_url(['app', app, view], _qs=dict(sid=sid))

            # Next see if it's a saved search
            isSavedSearch = job.get('isSavedSearch')

            label = job.get('label')
            owner = None
            if 'eai:acl' in job and 'owner' in job['eai:acl']:
                owner = job['eai:acl']['owner']

            if isSavedSearch and label and owner:
                if label in savedSearchViews:
                    view = savedSearchViews[label]
                else:
                    try:
                        savedSearch = splunk.entity.getEntity('saved/searches', label, namespace=app, owner=owner)
                        view = savedSearch.get('displayview')
                        if view: savedSearchViews[label] = view
                    except splunk.ResourceNotFound, e:
                        logger.debug("The saved search '%s' could not be found and was likely deleted. The default view will be used for this job." % label)
                        pass 
                    except splunk.AuthorizationFailed, e:
                        # splunkd will return a 403 forbidden if this attempts 
                        # to access someone elses namespace. See SPL-31588.
                        pass

            # If we got here, just use the default view
            if view == None:
                view = DEFAULT_DISPLAYVIEW
                if label: savedSearchViews[label] = view

            # Now can we construct the uri?
            if sid != None and app != None and view != None:
                return self.controller.make_url(['app', app, view], _qs=dict(sid=sid))

            # We cannot end up here right now, but if we do, render no link
            return None

        try:
            cherrypy.session.release_lock()

            entity_args = {
                'count': count,
                'offset': offset,
                'search': search,
                'sort_key': sortKey,
                'sort_dir': sortDir,
                'unique_key': 'id'
            }
            
            # Omit _AUTOSUMMARY_ jobs and their summarization jobs
            omit_autosummary = '(NOT CASE(_ACCELERATE_) AND NOT CASE(_AUTOSUMMARY_) AND NOT "|*summarize*action=")'
            if entity_args['search']:
                entity_args['search'] = omit_autosummary + ' AND (' + entity_args['search'] + ')'
            else:
                entity_args['search'] = omit_autosummary
            
            # The filters end up being used to construct a search
            # which is applied to the jobs endpoint.
            filters = {}

            # Omit data preview jobs.
            filters['NOT isDataPreview'] = '1'
            
            if not app == None and not app == '*':
                filters["eai:acl.app"] = app
            
            if not user == None and not user == '*':
                filters["eai:acl.owner"] = user
                
            if not label == None:
                filters['label'] = label
                
            if not jobStatus == None and not jobStatus == '*':
                if jobStatus == 'running':
                    filters['isDone'] = 0
                    filters['isPaused'] = 0
                    filters['isFinalized'] = 0
                elif jobStatus == 'done':
                    filters['isDone'] = 1
                elif jobStatus == 'paused':
                    filters['isPaused'] = 1
                elif jobStatus == 'finalized':
                    filters['isFinalized'] = 1
            
            if filters.keys():
                search_str = ' '.join(['%s="%s"' % (key, filters[key]) for key in filters])
                entity_args['search'] = ' '.join([entity_args['search'], search_str])
            
            jobs_collection = splunk.entity.getEntities('search/jobs', **entity_args)
        except splunk.ResourceNotFound, e:
            raise cherrypy.HTTPError(status=404, message="Cannot find job listing." % sid)
        
        jobs = []
        for job in jobs_collection.values():
            
            tmp_job = {}
            
            for key in job.keys():
                if key.startswith('is'):
                    tmp_job[key] = splunk.util.normalizeBoolean(job[key])
                elif key.endswith('Time'):
                    tmp_job[key] = splunk.util.parseISO(job[key])
            
            try:
                runDuration = job.get('runDuration')
                if runDuration:
                    runtime = util.get_time(seconds=float(runDuration),hourCap=True)
                else:
                    runtime = util.get_time(seconds=0.0)
            except ValueError:
                logger.warn('Could no coerce runDuration "%s" to a float.' % runDuration)
                runtime = util.get_time(seconds=0.0)
            
            try:
                ttl = job.get('ttl')
                if ttl:
                    tmp_job['ttl'] = int(ttl)
                else:
                    tmp_job['ttl'] = -1
            except ValueError:
                logger.warn('Could not coerce ttl "%s" into an integer.' % ttl)
                tmp_job['ttl'] = -1
                
            try:
                eventCount = job.get('eventCount')
                if eventCount:
                    tmp_job['eventCount'] = i18n.format_number(int(eventCount))
                else:
                    tmp_job['eventCount'] = i18n.format_number(0)
            except ValueError:
                logger.warn('Could not coerce eventCount "%s" into an integer.' % eventCount)
                tmp_job['eventCount'] = i18n.format_number(0)
                
            try:
                doneProgress = job.get('doneProgress')
                if doneProgress:
                    tmp_job['doneProgress'] = float(doneProgress)
                else:
                    tmp_job['doneProgress'] = 0.0
            except ValueError:
                logger.warn('Could not coerce doneProgress "%s" into a float.' % doneProgress)
                tmp_job['doneProgress'] = 0.0

            # Adapting search command (SPL-50266)
            jobName = job.name.strip()
            if jobName.startswith('|'):
                pass
            elif jobName.startswith('search '):
                jobName = jobName[7:]
            else:
                jobName = '| ' + jobName
                
            # Determine if we're dealing with epoch times, and if so set some bools for use by the view
            tmp_job['earliestEpoch'] = False
            tmp_job['latestEpoch'] = False

            earliest = tmp_job.get('earliestTime')
            if earliest and earliest.year == 1969 and earliest.day == 31 and earliest.month == 12:
                tmp_job['earliestEpoch'] = True

            latest = tmp_job.get('latestTime')
            if latest and latest.year == 1969 and latest.day == 31 and latest.month == 12:
                tmp_job['latestEpoch'] = True
            
            tmp_job['export'] = 'dispatch.evaluate.export' in job.get('performance', {})
            
            tmp_job['inpsectUri'] = self.controller.make_url(['manager', kw.get('client_app', 'system'), 'job_inspector'], _qs=dict(sid=job.get('sid')))

            tmp_job['dispatchState'] = job.get('dispatchState')
            
            tmp_job.update({
                'user': job.owner,
                'app': getJobApp(job),
                'runtime': '%02i:%02i:%02i' % (runtime[2], runtime[3], runtime[4]),
                'expires': getJobExpiresString(tmp_job, job.createTime.tzinfo),
                'status': getJobStatusString(tmp_job),
                'createTime': i18n.format_date(job.createTime, 'short') + ' ' + i18n.format_time(job.createTime),
                'earliestTime': ' '.join([i18n.format_date(tmp_job.get('earliestTime'), 'short'), i18n.format_time(tmp_job.get('earliestTime'))]),
                'latestTime': ' '.join([i18n.format_date(tmp_job.get('latestTime'), 'short'), i18n.format_time(tmp_job.get('latestTime'))]) if tmp_job.get('latestTime') != None else None,
                'uri': getJobURI(job),
                'sid': job.get('sid'),
                'search': jobName,
                'label': job.get('label'),
                'diskUsage' : ("%.2fMB" % (int(job.get('diskUsage', '0'))/1048576.0))
            })
            jobs.append(tmp_job)

        cherrypy.response.headers['X-Splunk-List-Length'] = jobs_collection.totalResults
        return self.controller.render_template('jobs/JobManager_tr_template.html', {'data': jobs})

