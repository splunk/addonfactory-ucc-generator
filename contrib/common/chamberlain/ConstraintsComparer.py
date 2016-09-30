__author__ = 'Zimo'

import re
import copy
import Constants

RE_AND = re.compile('(?<!OR)(?P<and>(AND)? +)(?=(tag|\())')

class ConstraintsComparer(object):

    @classmethod
    def _extract_constraint(cls, cons_object):
        if "search" in cons_object:
            ret = cons_object["search"].encode().strip()
            ret = re.sub(' +\= +', '=', ret)
            ret = '({})'.format(RE_AND.sub(Constants.CONNECTOR_AND, ret))
            ret = ret.replace('\"', '')
            return ret

    @classmethod
    def _extract_connector(cls, array_tags):
        ret = []
        for index, tag in enumerate(array_tags):
            if type(tag) is list:
                ret.append(cls._extract_connector(tag))
            else:
                ret.extend(tag.split())
        return ret

    @classmethod
    def _parse_from_dm(cls, cons_object):
        cons_tags = cls._extract_constraint(cons_object)
        cons_tags = re.sub('\(', '",["', cons_tags)
        cons_tags = re.sub('\)', '"],"', cons_tags)
        cons_tags = re.sub('(,""|"",)', '', cons_tags)
        cons_tags = cons_tags.strip('",')
        array_tags = eval(cons_tags)
        # sample for array_tags:
        # ['tag=performance', 'AND', ['tag=cpu', 'OR', 'tag=facilities', 'OR', 'tag=memory', 'OR', 'tag=storage', 'OR', 'tag=network', 'OR', ['tag=os', 'AND', [['tag=time', 'AND', 'tag=synchronize'], 'OR', 'tag=uptime']]]]
        array_tags = cls._extract_connector(array_tags)
        all = cls._flat_tags(array_tags)
        for index, tags in enumerate(all):
            all[index] = tags.split(Constants.CONNECTOR_AND)

        return all

    @classmethod
    def _check_tag(cls, tag):
        ret = Constants.TYPE_TAG
        if type(tag) is list:
            ret = Constants.TYPE_ARRAY
        elif Constants.CONNECTOR_AND.find(tag) > -1:
            ret = Constants.CONNECTOR_AND
        elif Constants.CONNECTOR_OR.find(tag) > -1:
            ret = Constants.CONNECTOR_OR
        return ret

    @classmethod
    def _flat_tags(cls, array_tags):
        buf = []
        ret = []
        connector = None
        for index, tag in enumerate(array_tags):
            check = cls._check_tag(tag)
            if check is Constants.CONNECTOR_AND or check is Constants.CONNECTOR_OR:
                connector = check
                continue

            temp = []
            if check is Constants.TYPE_ARRAY:
                temp = cls._flat_tags(tag)
            elif check is Constants.TYPE_TAG:
                temp = [tag]

            if connector is Constants.CONNECTOR_AND:
                ret = []
                for index_buf, tag_buf in enumerate(buf):
                    for index_temp, tag_temp in enumerate(temp):
                        ret.append('{}{}{}'.format(tag_buf, Constants.CONNECTOR_AND, tag_temp))
            elif connector is None or connector is Constants.CONNECTOR_OR:
                ret.extend(temp)
            buf = ret
        return ret


    @classmethod
    def compare_td(cls, from_ta, from_dm):
        # from_ta: ['tag=performance', 'tag=storage']
        # from_dm: [{'search': 'tag=listening tag=port'},
        #            {'search': '(tag=listening tag=port) OR (tag=process tag=report) OR (tag=service tag=report)'}]
        # from_ta.sort()
        ret = []
        for cons_object in from_dm:
            all = cls._parse_from_dm(cons_object)
            match = False
            for i in all:
                cim_set = set(i)
                ta_set = set(from_ta)
                if cim_set.issubset(ta_set):
                    match = True
                    cls._extend_constraints(i, ret)
                    break
            if match == False:
                return False
        return ret if len(ret) > 0 else False

    @classmethod
    def _extend_constraints(cls, new_cons, existing_cons):
        for con in new_cons:
            try:
                existing_cons.index(con)
                continue
            except:
                existing_cons.append(con)

    @classmethod
    def _sort_list_by_len(cls, list):
        ret = []
        sort_list = []
        for i in list:
            sort_list.append((len(i), i))
        sort_list = sorted(sort_list, key=lambda x:x[0], reverse=True)
        for i in sort_list:
            ret.append(i[1])
        return ret


    @classmethod
    def compare_dd(cls, from_dm, from_dm_1):
        ret = []
        alls = []
        final_alls = []
        for cons_object in from_dm:
            all = cls._parse_from_dm(cons_object)
            alls.append(all)

        alls = cls._sort_list_by_len(alls)
        for all in alls:
            if len(final_alls) == 0:
                final_alls = copy.deepcopy(all)
                continue
            for i in all:
                for j in final_alls:
                    j.extend(i)
        ret = False
        for all in final_alls:
            ret = cls.compare_td(all, from_dm_1)
            if ret:
                break
        return ret
