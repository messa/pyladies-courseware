#!/usr/bin/env python3

from setuptools import setup, find_packages

setup(
    name='cw-backend',
    version='0.0.1',
    description='Pyladies Courseware - backend',
    classifiers=[
        'Programming Language :: Python :: 3.5',
    ],
    packages=find_packages(exclude=['doc', 'tests*']),
    install_requires=[
        'aiohttp',
        'pyyaml',
        'requests',
        'requests_oauthlib',
        'simplejson',
    ])
