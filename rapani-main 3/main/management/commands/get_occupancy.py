from django.core.management.base import BaseCommand
from main.models import Hall, Projection
import requests
from datetime import datetime, timedelta, timezone
class Command(BaseCommand):
    help = 'Describe your command here'

    def handle(self, *args, **options):
        resp = requests.get('https://www.kinoarena.com/api/air-conditioning/11/schedule?apiKey=tqU7nYbpQwuqMyOdp23kPwyRGr4EcKcn')
        for k, vv in resp.json()["sessions"].items():
            for v in vv:
                Projection.objects.update_or_create(
                    session_id=v["uniqueSessionId"],
                    defaults={
                        "hall_name": v["screenName"],
                        "end_time":datetime.strptime(v["date"], '%d-%m-%Y %H:%M:%S') + timedelta(minutes=v["duration"]),
                        "start_time": datetime.strptime(v["date"], '%d-%m-%Y %H:%M:%S'),
                        "hall": Hall.objects.filter(name=v["screenName"]).last(),
                        "movie_title": v["movieName"],
                    }
                )

        