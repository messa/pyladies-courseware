messa_gpg_id=9D43AE9B01D9017B11F04FF26FDE87E9AF1A2725
encukou_gpg_id=AD4DFBDB5D404CA80600A5F40BA870E79E172F37
braba_gpg_id=DC07E57DA0846CEDCDC555E96D3ECD0E91DEAEE0

run_setup_playbooks:
	test -f vault_password
	ansible-playbook playbooks/setup_*.yml
	#ansible-playbook --vault-password-file ../vault_password -i localhost, *.yml

edit_secrets:
	EDITOR=vim ansible-vault edit secrets.yml

show_secrets:
	ansible-vault view secrets.yml

vault_password.gpg: vault_password
	gpg2 --armor --sign --encrypt -r $(messa_gpg_id) -r $(encukou_gpg_id) -r $(braba_gpg_id) -o $@ $<

vault_password:
	test ! -e $@.gpg
	openssl rand -base64 15 | tr /+ _- > $@
	chmod go-rwx $@

mongo_shell_docker:
	docker run --rm -it --net=host mongo:4.0-xenial mongo --username root --password
