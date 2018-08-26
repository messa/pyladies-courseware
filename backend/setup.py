#!/usr/bin/env python3

import sys
from setuptools import setup, find_packages

if sys.version_info < (3,6):
    sys.exit('Sorry, Python < 3.6 is not supported')

setup(
    name='cw-backend',
    version='0.0.1',
    description='Pyladies Courseware - backend',
    classifiers=[
        'Programming Language :: Python :: 3.6',
    ],
    packages=find_packages(exclude=['doc', 'tests*']),
    install_requires=[
        'aiohttp',
        'bcrypt',
        'markdown',
        'motor',
        'pyyaml',
        'requests',
        'requests_oauthlib',
        'simplejson',
    ],
    entry_points={
        'console_scripts': [
            'cw-backend=cw_backend:cw_backend_main',
        ],
    })
