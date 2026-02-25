from django.views.generic import TemplateView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from main.models import Camera, CameraReading
from django.http import JsonResponse, HttpResponseNotAllowed, HttpResponse
from django.core.exceptions import SuspiciousOperation
import json
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import base64


class DashboardView(TemplateView):
    template_name = "main/dashboard.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["cameras"] = Camera.objects.all()
        return context


class CameraView(TemplateView):
    template_name = "main/camera.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["camera"] = Camera.objects.get(id=kwargs["camera"])
        return context


class CameraStateJSONView(View):
    def get(self, *args, **kwargs):
        cameras = Camera.objects.all()
        if kwargs.get("camera"):
            cameras = Camera.objects.filter(id=kwargs.get("camera"))
        return JsonResponse(
            {
                camera.id: {
                    "last_reading": camera.get_last_reading().to_data_dict(),
                    "settings": camera.get_settings(),
                }
                for camera in cameras
            }
        )

    def post(self, *args, **kwargs):
        if not kwargs.get("camera"):
            return HttpResponseNotAllowed(["GET"])
        camera = Camera.objects.get(id=kwargs.get("camera"))
        new_settings = json.loads(self.request.body)
        invalid_props = [
            prop
            for prop in new_settings.keys()
            if prop not in camera.get_settings_full().keys()
        ]
        if invalid_props:
            raise SuspiciousOperation(f"Invalid settings: {invalid_props}")
        for prop, value in new_settings.items():
            setattr(camera, prop, value)
        if "auto_mode" in new_settings:
            if not camera.auto_mode:
                last_reading = camera.get_last_reading()
                for param in ["compressor_on", "ventilation_on", "heater_on"]:
                    if getattr(camera, param) is None:
                        setattr(camera, param, getattr(last_reading, param))
            else:
                for param in ["compressor_on", "ventilation_on", "heater_on"]:
                    setattr(camera, param, None)
        camera.save()
        return JsonResponse(camera.get_settings_full())


@method_decorator(csrf_exempt, name="dispatch")
class RaspberryView(View):
    def post(self, *args, **kwargs):
        auth_header = self.request.META.get("HTTP_AUTHORIZATION", "")
        token_type, _, credentials = auth_header.partition(" ")
        expected = base64.b64encode(b"raspberries:rapanarapana").decode()
        if token_type != "Basic" or credentials != expected:
            return HttpResponse(status=401)

        camera = Camera.objects.get(id=kwargs.get("camera"))
        CameraReading.objects.create(camera=camera, **json.loads(self.request.body))
        return JsonResponse(camera.get_settings())


class CameraChartDataView(View):
    def get(self, *args, **kwargs):
        return JsonResponse(
            list(
                CameraReading.objects.filter(camera_id=kwargs.get("camera"))
                .order_by("-created_at")
                .values_list(
                    "temperature",
                    "evaporator_temperature",
                    "humidity",
                    "supply_voltage",
                    "created_at"
                )[:int(self.request.GET.get('n') or 200)]
            ),
            safe=False,
        )


# @login_required
# def alarm(request):
#    if request.method == 'GET':
#        active_alarms = Alarm.objects.exclude(alarmstop__user=request.user).exclude(created__date__lt=date.today())
#        return JsonResponse({'alarms': [
#            {
#                'pk': alarm.pk,
#                'created': alarm.created,
#                'text': alarm.text
#            } for alarm in active_alarms
#        ]})
#    if request.method == 'POST':
#        data = json.loads(request.body)
#        if data.get('create'):
#            alarm = Alarm.objects.create(text=data['text'])
#            alarm.notify()
#            return JsonResponse({'created': True})
#        for alarm in Alarm.objects.exclude(alarmstop__user=request.user).exclude(created__date__lt=date.today()):
#            AlarmStop.objects.create(user=request.user, alarm=alarm)
#        return JsonResponse({'stopped': True})
#
#
# @login_required
# def test_alarma(request):
#    return render(request, 'main/test_alarma.html')
#
# @login_required
# def dashboard_settings(request):
#    user_settings = DashBoardSettings.objects.filter(user=request.user).first()
#    if request.method == 'GET':
#        if not user_settings:
#            user_settings = DashBoardSettings.create(user=request.user, settings='{}')
#        return HttpResponse(
#            user_settings.settings
#        )
#    if request.method == 'POST':
#        if not user_settings:
#            user_settings = DashBoardSettings.objects.create(user=request.user, settings=request.body.decode('utf-8'))
#        else:
#            user_settings.settings = request.body.decode('utf-8')
#            user_settings.save()
#        return HttpResponse(
#            user_settings.settings
#        )
#
# @login_required
# def sample_settings(request):
#    user_settings = SampleSettings.objects.filter(user=request.user).first()
#    if request.method == 'GET':
#        if not user_settings:
#            user_settings = SampleSettings.create(user=request.user, settings='{}')
#        return HttpResponse(
#            user_settings.settings
#        )
#    if request.method == 'POST':
#        if not user_settings:
#            user_settings = SampleSettings.objects.create(user=request.user, settings=request.body.decode('utf-8'))
#        else:
#            user_settings.settings = request.body.decode('utf-8')
#            user_settings.save()
#        return HttpResponse(
#            user_settings.settings
#        )
#
