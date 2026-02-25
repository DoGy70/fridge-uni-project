import asyncio
from random import randint
from django.core.management.base import BaseCommand
from asgiref.sync import sync_to_async
from main.models import Camera, CameraReading


class Command(BaseCommand):

    def handle(self, *args, **options):
        asyncio.run(self.run_async())

    async def run_async(self):
        await sync_to_async(Camera.objects.all().delete)()

        cameras = []
        for camera_id, camera_name in [
            ("first", "Първа"),
            ("second", "Втора"),
            ("third", "Трета"),
            ("fourth", "Четвърта"),
            ("fifth", "Пета"),
            ("sixth", "Шеста"),
        ]:
            camera = await sync_to_async(Camera.objects.create)(
                id=camera_id,
                name=camera_name,
                target_temperature=15.0,
                defrost_threshold_temperature=4.0,
                auto_mode=True,
                defrost_type="AUTO",
                temperature_low=13.5,
                temperature_high=16.5,
                evaporator_temperature_low=35,
                evaporator_temperature_high=70,
                humidity_low=60,
                humidity_high=90,
                supply_voltage_low=210.0,
                supply_voltage_high=230.0,
            )
            cameras.append(camera)

        await asyncio.gather(
            *(self.generate_readings(camera, i) for i, camera in enumerate(cameras))
        )

    async def generate_readings(self, camera, index):
        fake_temperature = randint(100, 200) / 10
        fake_voltage = randint(2120, 2260) / 10
        fake_evaporator_temperature = randint(300, 500) / 10
        fake_humidity = randint(600, 900) / 10
        fake_compressor_cycle = [True]*20 + [False]*10
        fake_ventilation_cycle = [True]*8 + [False]*32
        fake_compressor_cycle_i = randint(0, len(fake_compressor_cycle))
        fake_ventilation_cycle_i = randint(0, len(fake_ventilation_cycle))

        await asyncio.sleep(randint(0, 5))

        while True:
            camera_settings = await sync_to_async(Camera.objects.get)(pk=camera.pk)

            compressor_on = fake_compressor_cycle[fake_compressor_cycle_i%len(fake_compressor_cycle)]
            ventilation_on = fake_ventilation_cycle[fake_ventilation_cycle_i%len(fake_compressor_cycle)]
            heater_on = False

            if not camera_settings.auto_mode:
                compressor_on = camera_settings.compressor_on
                ventilation_on = camera_settings.ventilation_on
                heater_on = camera_settings.heater_on


            await sync_to_async(CameraReading.objects.create)(
                camera=camera,
                temperature=round(fake_temperature, 1),
                target_temperature=camera_settings.target_temperature,
                defrost_threshold_temperature=camera_settings.defrost_threshold_temperature,
                evaporator_temperature=round(fake_evaporator_temperature, 1),
                supply_voltage=round(fake_voltage, 1),
                humidity=round(fake_humidity, 1),
                auto_mode=camera_settings.auto_mode,
                compressor_on=compressor_on,
                ventilation_on=ventilation_on,
                heater_on=heater_on,
                defrost_type=camera_settings.defrost_type,
                status="ON",
                problem=False,
            )

            fake_compressor_cycle_i += randint(0, 3)
            fake_ventilation_cycle_i += randint(0, 3)

            temperature_modifier = randint(0, 5) / 10
            if camera_settings.temperature_low < fake_temperature < camera_settings.temperature_high:
                fake_temperature += randint(-1, 1) * temperature_modifier
            elif fake_temperature < camera_settings.temperature_low:
                fake_temperature += temperature_modifier
            else:
                fake_temperature -= temperature_modifier

            voltage_modifier = randint(0, 20) / 10
            if camera_settings.supply_voltage_low < fake_voltage < camera_settings.supply_voltage_high:
                fake_voltage += randint(-1, 1) * voltage_modifier
            elif fake_voltage < camera_settings.supply_voltage_low:
                fake_voltage += voltage_modifier
            else:
                fake_voltage -= voltage_modifier

            evaporator_temperature_modifier = randint(0, 10) / 10
            if (
                camera_settings.evaporator_temperature_low
                < fake_evaporator_temperature
                < camera_settings.evaporator_temperature_high
            ):
                fake_evaporator_temperature += (
                    randint(-1, 1) * evaporator_temperature_modifier
                )
            elif fake_evaporator_temperature < camera_settings.evaporator_temperature_low:
                fake_evaporator_temperature += evaporator_temperature_modifier
            else:
                fake_evaporator_temperature -= evaporator_temperature_modifier

            humidity_modifier = randint(0, 20) / 10
            if camera_settings.humidity_low < fake_humidity < camera_settings.humidity_high:
                fake_humidity += randint(-1, 1) * humidity_modifier
            elif fake_humidity < camera_settings.humidity_low:
                fake_humidity += humidity_modifier
            else:
                fake_humidity -= humidity_modifier

            await asyncio.sleep(5 + randint(-64, 64) / 100)