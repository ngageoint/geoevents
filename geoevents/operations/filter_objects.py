# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

import operator
from decimal import Decimal


def operations_to_functions(operation, a, b):
    if operation == ">=":
        return operator.__ge__(a, b)
    if operation == "<=":
        return operator.__le__(a, b)
    if operation == "=":
        return operator.__eq__(a, b)
    if operation == ">":
        return operator.__gt__(a, b)
    if operation == "<":
        return operator.__lt__(a, b)


def filter_rows(obj, filt):
    field_value = obj.__getattribute__(filt.field)
    field_type = obj._meta.get_field(filt.field).get_internal_type()

    if field_type == 'DecimalField':
        filt.value = Decimal(filt.value)
    elif field_type == 'IntegerField':
        filt.value = int(filt.value)

    '''
    if isinstance(field_value, Decimal):
        filt.value = Decimal(filt.value)
    elif isinstance(field_value, int):
        filt.value = int(filt.value)
    '''
    return operations_to_functions(filt.operation_type, field_value, filt.value)


if __name__ == '__main__':
    pass
