from django.urls import path
from . import views

urlpatterns = [
    path("", views.DashboardView.as_view(), name="dashboard"),
    path("camera/<str:camera>", views.CameraView.as_view(), name="camera_detail"),
    path("state", views.CameraStateJSONView.as_view(), name="camera_state"),
    path("state/<str:camera>", views.CameraStateJSONView.as_view(), name="camera_state_single"),
    path("update/<str:camera>", views.RaspberryView.as_view(), name="camera_update"),
    path("data/<str:camera>", views.CameraChartDataView.as_view(), name="chart_data")
    #path("alarm", views.alarm, name="alarm"),
    #path("dashboard_settings", views.dashboard_settings, name="dashboard_settings"),
    #path("sample_settings", views.sample_settings, name="sample_settings"),
    #path("test_alarma", views.test_alarma, name="test_alarma")
]