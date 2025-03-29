from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers.auth import LogSerializer, RegSerializer


@api_view(['POST'])
def log_in_handler(request):
    serializer = LogSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']
    if not user:
        return Response({"error": {'code': 401, "message": "Authentication failed"}}, status=401)
    token, created = Token.objects.get_or_create(user=user)
    return Response({'data': {"user_token": token.key}}, status=200)

@api_view(['POST'])
def sign_up_handler(request):
    serializer = RegSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    token = Token.objects.create(user=user)
    return Response({"data": {"user_token": token.key}}, status=201)

@api_view(['GET'])
def log_out_handler(request):
    if not request.user.is_active:
        return Response({"error": {'code': 403, "message": "Login failed"}}, status=403)
    request.user.auth_token.delete()
    return Response({"data": {'message': "Log out"}}, status=200)