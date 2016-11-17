
from __future__ import absolute_import

from ..util import get_base_app_name
from .field import RestField


__all__ = [
    'RestModel',
    'SingleModel',
    'MultipleModel',
    'DataInputModel',
]


class RestModel(object):
    """
    REST Model.
    """

    def __init__(
            self,
            fields,
            user='nobody',
            app=get_base_app_name(),
            *args,
            **kwargs
    ):
        """

        :param fields: a list of RestField instances
        :param args:
        :param kwargs:
        """
        self.user = user
        self.app = app
        self.fields = fields
        self.args = args
        self.kwargs = kwargs

    @property
    def endpoint(self):
        """
        Endpoint of Splunk service.

        :return:
        """
        raise NotImplementedError()

    def real_model(self, name, data):
        """
        Real model for given name & data.

        :param name:
        :param data:
        :return:
        """
        raise NotImplementedError()

    def _loop_fields(self, meth, *args, **kwargs):
        return map(
            lambda f: getattr(f, meth)(*args, **kwargs),
            self.fields,
        )

    def validate(self, data):
        self._loop_fields('validate', data)

    def encode(self, data):
        self._loop_fields('encode', data)

    def decode(self, data):
        self._loop_fields('decode', data)


class SingleModel(RestModel):
    """
    REST Model with Single Mode. It will store stanzas
    with same format  into one conf file.
    """

    def __init__(
            self,
            conf_name,
            fields,
            user='nobody',
            app=get_base_app_name(),
            *args,
            **kwargs
    ):
        """

        :param conf_name: conf file name
        :param fields: a list of RestField instances
        :param args:
        :param kwargs:
        """
        super(SingleModel, self).__init__(
            fields, user=user, app=app, *args, **kwargs)

        self.conf_name = conf_name

    @property
    def endpoint(self):
        return 'configs/conf-{}'.format(self.conf_name)

    def real_model(self, name, data):
        return self


class MultipleModel(RestModel):
    """
    REST Model with Multiple Modes. It will store
     stanzas with different formats into one conf file.
    """

    def __init__(
            self,
            conf_name,
            real_fields,
            user='nobody',
            app=get_base_app_name(),
            *args,
            **kwargs
    ):
        """

        :param conf_name:
        :type conf_name: basestring
        :param real_fields: used to create SingleModel instance.
            A dict of: ``name``==> ``fields``
        :type real_fields: dict
        :param args:
        :param kwargs:
        """
        super(MultipleModel, self).__init__(
            None, user=user, app=app, *args, **kwargs)

        self.conf_name = conf_name
        self.real_models = self._build_real_models(real_fields)

    @property
    def endpoint(self):
        return 'configs/conf-{}'.format(self.conf_name)

    def real_model(self, name, data):
        real_model = self.real_models[name]
        if real_model.conf_name is None:
            real_model.conf_name = self.conf_name
        return real_model

    def _build_real_models(self, real_fields):
        real_models = {}
        for name, fields in real_fields.iteritems():
            real_model = SingleModel(
                self.conf_name,
                fields,
                user=self.user,
                app=self.app,
                *self.args,
                **self.kwargs
            )
            real_models[name] = real_model
        return real_models


class DataInputModel(RestModel):
    """
    REST Model for Data Input.
    """

    def __init__(
            self,
            input_type,
            fields,
            user='nobody',
            app=get_base_app_name(),
            *args,
            **kwargs
    ):
        super(DataInputModel, self).__init__(
            fields, user=user, app=app, *args, **kwargs)

        self.input_type = input_type

    @property
    def endpoint(self):
        return 'data/inputs/{}'.format(self.input_type)

    def real_model(self, name, data):
        return self
