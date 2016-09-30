'''
The rule of SPL is that only single pair is required to be offered
'''
cpu = '| search index="_introspection" component=hostwide | spath output=cpu1 path=data.cpu_user_pct | spath output=cpu2 path=data.cpu_system_pct | eval cpu_total=cpu1+cpu2 | table cpu_total'
memory = '| search index="_introspection" component=hostwide| table data.mem_used'
process_splunkd = '| search index="_introspection" component=perprocess data.process=splunkd | spath output=cpu path=data.pct_cpu | stats sum(cpu) as totalcpu by datetime'