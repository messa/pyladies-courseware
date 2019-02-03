import yaml


try:
    from yaml import CLoader as Loader, CDumper as Dumper
except ImportError as e:
    from yaml import Loader, Dumper


def yaml_dump(obj, Dumper=None, Loader=None, indent=None, width=250):
    '''
    :return: YAML string
    '''
    return yaml.dump(
        obj,
        Dumper=Dumper or CustomDumper,
        default_flow_style=False,
        allow_unicode=True,
        width=width,
        indent=indent)


def yaml_load(s, Loader=None):
    '''
    :return: object loaded from YAML string
    '''
    assert isinstance(s, str)
    return yaml.load(s, Loader=Loader or CustomLoader)



# Low-level stuff
# ---------------


class CustomLoader (Loader):
    '''
    Customized yaml.Loader
    '''
    pass


class CustomDumper (Dumper):
    '''
    Customized yaml.Dumper
    '''
    pass


# str

def _str_representer(dumper, data):
    style = '|' if '\n' in data else None
    return dumper.represent_scalar('tag:yaml.org,2002:str', data, style=style)

CustomDumper.add_representer(str, _str_representer)


# UUID

from uuid import UUID

def _uuid_representer(dumper, data):
    return dumper.represent_scalar('!UUID', str(data), style="'")

def _uuid_constructor(loader, node):
    value = loader.construct_scalar(node)
    return UUID(value)

CustomLoader.add_constructor('!UUID', _uuid_constructor)
CustomDumper.add_representer(UUID, _uuid_representer)


# ObjectId

try:
    from bson import ObjectId
except ImportError:
    ObjectId = None

def _objectid_representer(dumper, data):
    return dumper.represent_scalar('!ObjectId', str(data), style="'")

def _objectid_constructor(loader, node):
    assert ObjectId is not None, 'could not import bson'
    value = loader.construct_scalar(node)
    return ObjectId(value)

CustomLoader.add_constructor('!ObjectId', _objectid_constructor)
if ObjectId is not None:
    CustomDumper.add_representer(ObjectId, _objectid_representer)
