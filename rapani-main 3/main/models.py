from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import Q, CheckConstraint
from datetime import datetime, timedelta

User = get_user_model()


class Camera(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=64, null=False, blank=False)

    # Parameters
    target_temperature = models.FloatField(null=False, blank=False)
    defrost_threshold_temperature = models.FloatField(null=False, blank=False)
    auto_mode = models.BooleanField(null=False, blank=False)
    compressor_on = models.BooleanField(null=True, blank=True)
    ventilation_on = models.BooleanField(null=True, blank=True)
    heater_on = models.BooleanField(null=True, blank=True)
    defrost_type = models.CharField(
        max_length=6,
        default="AUTO",
        choices=[("AUTO", "Естествено"), ("FORCED", "Принудително")],
    )

    # Thresholds
    temperature_low = models.FloatField(null=False, blank=False)
    temperature_high = models.FloatField(null=False, blank=False)
    evaporator_temperature_low = models.FloatField(null=False, blank=False)
    evaporator_temperature_high = models.FloatField(null=False, blank=False)
    humidity_low = models.FloatField(null=False, blank=False)
    humidity_high = models.FloatField(null=False, blank=False)
    supply_voltage_low = models.FloatField(null=False, blank=False)
    supply_voltage_high = models.FloatField(null=False, blank=False)

    class Meta:
        constraints = [
            CheckConstraint(
                check=(
                    (
                        Q(auto_mode=True)
                        & Q(compressor_on__isnull=True)
                        & Q(ventilation_on__isnull=True)
                        & Q(heater_on__isnull=True)
                    )
                    | (
                        Q(auto_mode=False)
                        & Q(compressor_on__isnull=False)
                        & Q(ventilation_on__isnull=False)
                        & Q(heater_on__isnull=False)
                    )
                ),
                name="camera_auto_mode_check",
            ),
        ]

    def get_last_reading(self):
        return self.readings.order_by("-created_at").first()

    def get_settings_full(self):
        return {
            field.name: getattr(self, field.name)
            for field in self._meta.model._meta.fields
            if field.name
            not in (
                "id",
                "name",
            )
        }

    def get_settings(self):
        return {
            field.name: getattr(self, field.name)
            for field in self._meta.model._meta.fields
            if field.name
            in (
                "target_temperature",
                "defrost_threshold_temperature",
                "auto_mode",
                "compressor_on",
                "ventilation_on",
                "heater_on",
                "defrost_type",
            )
        }

    def __str__(self):
        return self.name


class CameraReading(models.Model):
    camera = models.ForeignKey(
        Camera, on_delete=models.CASCADE, related_name="readings"
    )
    temperature = models.FloatField(null=False, blank=False)
    target_temperature = models.FloatField(null=False, blank=False)
    defrost_threshold_temperature = models.FloatField(null=False, blank=False)
    supply_voltage = models.FloatField(null=False, blank=False)
    evaporator_temperature = models.FloatField(null=False, blank=False)
    humidity = models.FloatField(null=False, blank=False)
    defrost_type = models.CharField(
        max_length=6,
        blank=False,
        null=False,
        choices=[("AUTO", "Естествено"), ("FORCED", "Принудително")],
    )
    auto_mode = models.BooleanField(null=False, blank=False)
    compressor_on = models.BooleanField(null=False, blank=False)
    ventilation_on = models.BooleanField(null=False, blank=False)
    heater_on = models.BooleanField(null=False, blank=False)
    status = models.CharField(
        max_length=7,
        blank=False,
        null=False,
        choices=[("ON", "Включен"), ("OFF", "Изключен"), ("DEFROST", "Обезскрежаване")],
    )
    problem = models.BooleanField(null=False, blank=False, default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def to_data_dict(self):
        data = {
            field.name: getattr(self, field.name)
            for field in self._meta.model._meta.fields
            if field.name not in ("camera", "id", "status")
        }
        data["status"] = self.get_status_display()
        if self.is_old():
            data["problem"] = True
            data["status"] = "Няма връзка"
        data["parameters_not_in_sync"] = self.parameters_not_in_sync()
        return data

    def parameters_not_in_sync(self):
        return [
            parameter
            for parameter in (
                (
                    "target_temperature",
                    "defrost_threshold_temperature",
                    "auto_mode",
                    "compressor_on",
                    "ventilation_on",
                    "heater_on",
                    "defrost_type",
                )
                if not self.camera.auto_mode
                else (
                    "target_temperature",
                    "defrost_threshold_temperature",
                    "auto_mode",
                    "defrost_type",
                )
            )
            if getattr(self, parameter) != getattr(self.camera, parameter)
        ]

    def is_old(self):
        return datetime.now() - self.created_at.replace(tzinfo=None) > timedelta(
            seconds=15
        )


class Alarm(models.Model):
    text = models.TextField()
    created = models.DateTimeField(auto_now=True)

    def notify(self): ...


class AlarmStop(models.Model):
    alarm = models.ForeignKey(Alarm, on_delete=models.CASCADE)
    stopped = models.DateTimeField(auto_now=True)
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)

    def get_timedelta(self):
        return self.stopped - self.alarm.created


# class DashboardSettings(models.Model):
#    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)
#    settings = models.TextField()
#
#
# class SampleSettings(models.Model):
#    user = models.ForeignKey("auth.User", on_delete=models.CASCADE)
#    settings = models.TextField()
