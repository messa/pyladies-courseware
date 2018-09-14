#!/bin/bash
# This script is called from CircleCI via SSH - see .circleci/config.yml.
set -ex
cd "$(dirname "$0")"
./check_free_space.py
ansible-playbook playbooks/deploy_cw_demo.yml
