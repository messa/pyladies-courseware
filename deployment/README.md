Deployment
==========

Hosted on [DigitalOcean](https://m.do.co/c/389daec654bc)


Initial deployment
------------------

1. Create Debian 9 VM
2. Install ansible

   1. enable `stretch-backports` (in `/etc/apt/sources.list`)
   2. `apt install -t stretch-backports ansible`

3. Checkout repository

   1. `apt install git`
   2. `git clone https://github.com/messa/pyladies-courseware.git /root/pyladies-courseware`

4. Run playbooks

   1. `cd /root/pyladies-courseware/deployment`
   2. decrypt `vault_password.gpg`
   3. `chmod go-rwx vault_password`
   4. `apt install make`
   5. `make run_setup_playbooks`
   6. check `docker ps -a`

5. Finish MongoDB setup (sorry, not automated yet)

    ```
    # docker run --rm -it --net=host mongo:4.0-xenial mongo
    > rs.status()
    ...
      "errmsg" : "no replset config has been received",
    ...
    > rs.initiate()
    {
      "info2" : "no configuration specified. Using a default configuration for the set",
      "me" : "127.0.0.1:27017",
      "ok" : 1
    }
    cw0:SECONDARY> rs.status()
    ...
      "myState" : 1,
    ...
    cw0:PRIMARY> use admin
    cw0:PRIMARY> db.createUser({ user: 'root', pwd: '...', roles: ['root'] })
    Successfully added user: { "user" : "root", "roles" : [ "root" ] }
    cw0:PRIMARY> db.auth('root', '...')
    cw0:PRIMARY> use cw_prod
    cw0:PRIMARY> db.createUser({ user: 'cw_prod', pwd: '...', roles: [{ db: 'cw_prod', role: 'readWrite' }] })
    ```

6. Setup CircleCI user

   1. `adduser --disabled-password circleci`
   2. `visudo`, add line:

      ```
      circleci ALL=(ALL) NOPASSWD: /root/pyladies-courseware/deployment/ci_deploy.sh
      ```

      (TODO: automate)

   Setup CircleCI SSH key:

   1. Create SSH key
   2. Add to CircleCI project configuration
   3. Add fingerprint to `/home/circleci/.ssh/authorized_keys`.
      Disable passing secrets to builds from forks or pull requests.
