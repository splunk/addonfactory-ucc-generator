# Copyright Splunk

"""Library of functions useful across scripts."""
import logging
import sys
import subprocess

# Follows https://google-styleguide.googlecode.com/svn/trunk/pyguide.html


def run_cmd(cmd, **kwargs):
    """Run command and return tuple of (stdout, returncode) iff redirect_stdout

    Returns a tuple of (None, returncode) if redirect_stdout is False

    modifies is a synonym for expensive. If the cmd is expensive and you
    don't want to run it during a test modifies=True is your friend.

    Args:
      cmd: command to run with arguments as a list
      verbose: Print the command to  be run.
      dry_run: Testing mode that prints commands that would be run.
      modifies: Allow the caller to tell us if the cmd causes a state change.
      logging:
      redirect_stdout: Also return the stdout if this flag is set.
      shell: Run the command through /bin/sh
      exit_on_failure: Exit the program immediately, fail fast.
    """
    opts = {}
    opts['shell'] = False
    opts['exit_on_failure'] = True
    opts['redirect_stdout'] = False
    opts['verbose'] = False
    opts['dry_run'] = False
    opts['modifies'] = True

    for key, value in kwargs.iteritems():
        if key in opts:
            opts[key] = value

    if opts['verbose'] or opts['dry_run']:
        logging.info('+ %s', ' '.join(cmd))

    execute = False
    if opts['dry_run'] and not opts['modifies']:
        execute = True
    elif not opts['dry_run']:
        execute = True

    if not execute and opts['redirect_stdout']:
        test_out = '- sample output - not executing: %s' % cmd
        return (test_out, 0)
    elif not execute:
        return (None, 0)

    proc = subprocess.Popen(cmd, shell=opts['shell'], stdin=subprocess.PIPE,
                            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                            close_fds=True)

    (stdout, stderr) = proc.communicate()

    if proc.returncode != 0:
        logging.error('"%s" FAILED.', cmd)
        logging.error('stdout="%s"', stdout)
        logging.error('stderr="%s"', stderr)
        if opts['exit_on_failure']:
            sys.exit(1)

    if opts['redirect_stdout']:
        if logging.getLogger().getEffectiveLevel() == logging.DEBUG:
            logging.debug('stdout = "%s"', stdout)
        return (stdout, proc.returncode)

    return (None, proc.returncode)


# http://stackoverflow.com/questions/6200270/decorator-to-print-function-call-details-parameters-names-and-effective-values
def dump_args(func):
    '''Decorator to print function call details - parameters names and effective values'''
    def wrapper(*func_args, **func_kwargs):
        """wrapper."""
        arg_names = func.func_code.co_varnames[:func.func_code.co_argcount]
        args = func_args[:len(arg_names)]
        defaults = func.func_defaults or ()
        args = args + defaults[len(defaults) -
                               (func.func_code.co_argcount - len(args)):]
        params = zip(arg_names, args)
        args = func_args[len(arg_names):]
        if args:
            params.append(('args', args))
        if func_kwargs:
            params.append(('kwargs', func_kwargs))
        # print func.func_name + ' (' + ', '.join('%s = %r' % p for p in
        # params) + ' )'
        logging.debug(
            func.func_name +
            ' (' +
            ', '.join(
                '%s = %r' %
                p for p in params) +
            ' )')
        return func(*func_args, **func_kwargs)
    return wrapper


def set_logger(log_name=None):
    """Init logging."""
    if not log_name:
        print 'No log file name specified, error.'
        sys.exit(1)

    logger = logging.getLogger()
    handler = logging.FileHandler(log_name)
    formatter = logging.Formatter(
        '%(asctime)s %(levelname)-8s %(funcName)s %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.debug('set_logger(...) complete.')
