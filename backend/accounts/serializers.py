from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class UserSerializer(serializers.ModelSerializer):
    manager_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "manager",
            "manager_name",
        )
        read_only_fields = ("id", "full_name", "role", "manager", "manager_name")

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email

    def get_manager_name(self, obj):
        if not obj.manager:
            return None
        return obj.manager.get_full_name() or obj.manager.email


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "password")
        read_only_fields = ("id",)

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=User.Role.EMPLOYEE,
        )


class ManagerChoiceSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "full_name")

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email


class AssignManagerSerializer(serializers.Serializer):
    manager_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_manager_id(self, value):
        if value is None:
            return None
        try:
            manager = User.objects.get(id=value, role=User.Role.MANAGER)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError("Selected manager does not exist.") from exc
        return manager


class StaffMemberAdminUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=[User.Role.EMPLOYEE, User.Role.MANAGER], required=False)
    manager_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_manager_id(self, value):
        if value is None:
            return None
        try:
            manager = User.objects.get(id=value, role=User.Role.MANAGER)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError("Selected manager does not exist.") from exc
        return manager

    def validate(self, attrs):
        role = attrs.get("role")
        manager = attrs.get("manager_id", serializers.empty)

        if role == User.Role.MANAGER and manager not in (serializers.empty, None):
            raise serializers.ValidationError(
                {"manager_id": "Managers cannot be assigned to another manager."}
            )

        return attrs


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["role"] = user.role
        token["full_name"] = user.get_full_name()
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data
