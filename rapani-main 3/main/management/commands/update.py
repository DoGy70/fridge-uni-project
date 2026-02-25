from django.core.management.base import BaseCommand
from main.models import Hall, Projection, Sample, HvacCommand
from datetime import datetime, timedelta
from main.models import get_outside_temperature_cached
from django.db.models import Q
import time

def get_auto_command(sample):
    """
    Placeholder for auto command logic.
    This function should return the command to be executed based on the sample data.
    """
    # Example logic: if temperature is too high, turn on ventilation
    calculated_temperature = sample.target_temperature
    # calculated_fan_speed = sample.fan_speed
    calculated_fan_speed = 1
    uv_lamp = True
    ventilation_on = False
    if sample.co2 and sample.co2 > 800:
        ventilation_on = True
    if sample.occupancy == 0:
        calculated_temperature = 24
        calculated_fan_speed = 0
        uv_lamp = False
    elif sample.occupancy < 5:
        calculated_temperature = 23
        calculated_fan_speed = 1
    else:
        calculated_temperature = 22
        calculated_fan_speed = 1  
    
    return HvacCommand(
        hall=sample.hall,
        user=None,
        fan_speed=calculated_fan_speed,
        target_temperature=calculated_temperature,
        current_temperature=sample.temperature,
        ventilation_on=ventilation_on,
        uv_lamp=uv_lamp)

class Command(BaseCommand):
    help = 'Describe your command here'

    def handle(self, *args, **options):
        from random import randint
        # for p in Projection.objects.filter(start_time__date__lte=(datetime.now()).date()):
        #     p.forecast_tickets_sold = p.tickets_sold + randint(-10, 10)  # Simulate some fluctuation in occupancy
        #     if p.forecast_tickets_sold < 0:
        #         p.forecast_tickets_sold = 0
        #     p.save()
        # return None

        # for p in Projection.objects.filter(start_time__date__gt=(datetime.now()).date()):
        #     similar = Projection.objects.filter(movie_title=p.movie_title).exclude(id=p.id)
        #     avg = 0
        #     for s in similar:
        #         avg += s.tickets_sold if s.tickets_sold is not None else 0
        #     avg = avg // len(similar) if similar else 0
        #     p.forecast_tickets_sold = avg
        #     p.save()
        
        # return None
    


        # for p in Projection.objects.filter(start_time__date__gte=(datetime.now()-timedelta(days=0)).date(), start_time__date__lte=(datetime.now()).date()):
        #     p.tickets_sold = p.get_occupancy()[0]
        #     print(f"Updating projection {p.session_id} with occupancy {p.tickets_sold}")
        #     if p.tickets_sold is not None:
        #         p.save()
        while True:
            for hall in Hall.objects.all():
                data = hall.get_humidity_temperature_co2()
                hall.current_humidity = data.get("humidity")
                hall.current_temperature = data.get("temperature")
                hall.current_co2 = data.get("co2")
                now = datetime.now()
                p = Projection.objects.filter(hall=hall).filter(Q(start_time__lte=now + timedelta(hours=3)+ timedelta(minutes=15), start_time__gte=now + timedelta(hours=3))       | Q(end_time__gte=now + timedelta(hours=3), start_time__lte=now + timedelta(hours=3))       ).last()
                hall.current_occupancy = p.get_occupancy()[0] if p else 0
                sample = Sample(
                    hall=hall,
                    temperature=hall.current_temperature,
                    humidity=hall.current_humidity,
                    co2=hall.current_co2,
                    target_temperature=hall.target_temperature,
                    ventilation_on=hall.ventilation_on,
                    uv_lamp=hall.uv_lamp_on,
                    fan_speed=hall.fan_speed,
                    auto_mode=hall.auto_mode,
                    occupancy=hall.current_occupancy or 0,
                    outside_temperature=get_outside_temperature_cached(),
                    created_at=datetime.now()
                )
                if hall.auto_mode:
                    command = get_auto_command(sample)
                    if command.target_temperature != hall.target_temperature or \
                    command.ventilation_on != hall.ventilation_on or \
                    command.uv_lamp != hall.uv_lamp_on or \
                    command.fan_speed != hall.fan_speed:
                        hall.target_temperature = command.target_temperature
                        hall.ventilation_on = command.ventilation_on
                        hall.uv_lamp_on = command.uv_lamp
                        hall.fan_speed = command.fan_speed
                        command.save()
                sample.save()
                hall.save()
                time.sleep(5)
            time.sleep(30)
                

                
