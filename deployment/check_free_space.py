#!/usr/bin/env python3
import os, sys
ok = True
for p in '/', '/var/lib/docker':
    try:
        st = os.statvfs(p)
    except FileNotFoundError:
        continue
    free_bytes = st.f_bfree * st.f_frsize
    free_gb = free_bytes / 2**30
    #print('{:15} {:.2f} GB'.format(p, free_gb))
    if free_gb < 3:
        print('Free space too low: {}'.format(p), file=sys.stderr)
        ok = False
sys.exit(0 if ok else 1)
