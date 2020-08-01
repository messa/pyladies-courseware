#!/usr/bin/env python3

from graphql import print_schema
from cw_backend import graphql_schema

print(print_schema(graphql_schema).rstrip())
