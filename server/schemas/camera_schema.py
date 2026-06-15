from marshmallow import Schema, fields, validate

class CameraInstructionsSchema(Schema):
    compressor_on = fields.Bool(load_default=None)
    ventilation_on = fields.Bool(load_default=None)
    heater_on = fields.Bool(load_default=None)
    auto_mode = fields.Bool(load_default=None)
    target_temperature = fields.Float(load_default=None)
    defrost_threshold_temperature = fields.Float(load_default=None)
    defrost_type = fields.Str(
    load_default=None,
    validate=validate.OneOf(["AUTO", "FORCED"])
    )

class CameraPushSchema(Schema):
    temperature = fields.Float(required=True)
    evaporator_temperature= fields.Float(required=True)
    supply_voltage = fields.Float(required=True)
    humidity = fields.Float(required=True)
    compressor_on = fields.Bool(load_default=False)
    ventilation_on = fields.Bool(load_default=False)
    heater_on = fields.Bool(load_default=False)