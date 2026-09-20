import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError as AxiosErrorType } from 'axios';
import { toast } from 'sonner-native';

interface SignUpFormData {
    name: string;
    email: string;
    password: string;
}

const signupUser = async (userData: SignUpFormData) => {
    try {
        const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/api/signup`,
            userData
        );
        return response.data;
    } catch (error) {
        if (AxiosError(error)) {
            if (!error.response) {
                throw new Error('Network error. Please check your connection.');
            }

            const status = error?.response?.status;
            const errorData = error?.response?.data;
            const message = (errorData as { message?: string })?.message;

            if (status === 400 || status === 422) {
                throw new Error(
                    (errorData as { message?: string })?.message ||
                    'Invalid input data'
                );
            } else if (status === 409) {
                throw new Error(message || 'User already exists');
            } else if (status >= 500) {
                throw new Error(message || 'Server error. Please try again later.');
            }
            throw new Error(message || 'Sign up failed');
        }
        throw new Error('Something went wrong. Please try again.');
    }
};

export default function SignUpScreen() {
    // All hooks must be called inside the component
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const signupForm = useForm<SignUpFormData>({
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
    });

    const signupMutation = useMutation({
        mutationFn: signupUser,
        onSuccess: (data, variables) => {
            router.replace({
                pathname: '../signup-otp',
                params: {
                    name: variables.name,
                    email: variables?.email,
                    password: variables.password,
                },
            });
        },
        onError: (error: Error) => {
            toast.error(error?.message);
        },
    });
    const handleSignInNavigation = () => {
        router.push('../login');
    };

    const onSignUpSubmit = (data: SignUpFormData) => {
        signupMutation.mutate(data);
    };

    // const { errors, isValid } = form.formState;
    // const isBusy = signupMutation.isPending;

    return (
        <SafeAreaView className="flex-1 bg-[#8264A9]">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1 px-6"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View className="mt-16 mb-8">
                        <Text className="text-3xl font-kenao text-gray-800 mb-2">
                            Create your account
                        </Text>
                        <Text className="text-gray-700 text-base font-kenao">
                            Sign up to get started
                        </Text>
                    </View>

                    {/* Form fields */}
                    <View className="gap-6 mt-8">
                        {/* Full name */}
                        <View>
                            <Text className="text-gray-800 text-base font-kenao mb-3">Name</Text>
                            <Controller
                                control={signupForm.control}
                                name="name"
                                rules={{
                                    required: 'Full name is required',
                                    minLength: {
                                        value: 4,
                                        message: 'Name must be at least 4 characters',
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View
                                        className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-4 ${signupForm.formState.errors.name ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                    >
                                        <Ionicons name="person-outline" size={20} color="#4F2B50" />
                                        <TextInput
                                            className="flex-1 ml-3 text-gray-800 font-kenao"
                                            placeholder="Enter your full name"
                                            placeholderTextColor="#6b7280"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            keyboardType="default"
                                            autoCapitalize="words"
                                        />
                                    </View>
                                )}
                            />
                            {signupForm.formState.errors.name && (
                                <Text className="text-red-600 text-sm font-kenao mt-1">
                                    {signupForm.formState.errors.name.message}
                                </Text>
                            )}
                        </View>

                        {/* Email */}
                        <View>
                            <Text className="text-gray-800 text-base font-kenao mb-3">Email</Text>
                            <Controller
                                control={signupForm.control}
                                name="email"
                                rules={{
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                                        message: 'Please enter a valid email',
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-4 ${signupForm.formState.errors.email ? 'border-red-500' : 'border-gray-200'}`}>
                                        <MaterialCommunityIcons
                                            name="email-outline"
                                            size={20}
                                            color="#4F2B50"
                                        />
                                        <TextInput
                                            className="flex-1 ml-3 text-gray-800 font-kenao"
                                            placeholder="Enter your email address"
                                            placeholderTextColor="#6b7280"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                    </View>
                                )}
                            />
                            {signupForm.formState.errors.email && (
                                <Text className="text-red-600 text-sm font-kenao mt-1">
                                    {signupForm.formState.errors.email.message}
                                </Text>
                            )}
                        </View>

                        {/* Password */}
                        <View>
                            <Text className="text-gray-800 text-base font-kenao mb-3">
                                Password
                            </Text>
                            <Controller
                                control={signupForm.control}
                                name="password"
                                rules={{
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters',
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View
                                        className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-4 ${signupForm.formState.errors.password ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                    >
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={20}
                                            color="#4F2B50"
                                        />
                                        <TextInput
                                            className="flex-1 ml-3 text-gray-800 font-kenao"
                                            placeholder="Create a password"
                                            placeholderTextColor="#000000"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            secureTextEntry={!showPassword}
                                            editable={!signupMutation.isPending}
                                        />
                                        {signupForm.formState.errors.password && (
                                            <Text className="text-red-500 text-small font-kenao ml-2">
                                                {signupForm.formState.errors.password.message}
                                            </Text>
                                        )}
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            disabled={signupMutation.isPending}
                                        >
                                            <Ionicons
                                                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                                size={20}
                                                color="#4F2B50"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                            {/* {signupForm.formState.errors.password && (
                                <Text className="text-red-600 text-sm font-kenao mt-1">
                                    {signupForm.formState.errors.password.message}
                                </Text>
                            )} */}
                        </View>
                    </View>

                    {/* Submit button */}
                    <TouchableOpacity
                        className={`rounded-xl py-4 mt-8 ${signupForm.formState.isValid ? 'bg-[#8264A9]' : 'bg-gray-400'
                            }`}
                        onPress={signupForm.handleSubmit(onSignUpSubmit)}
                        disabled={!signupForm.formState.isValid || signupMutation.isPending}
                    >
                        <Text className="text-white text-center text-lg font-kenao">
                            {signupMutation.isPending
                                ? 'Creating Account...'
                                : 'Create Account'}
                        </Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View className="flex-row items-center my-8">
                        <View className="flex-1 h-px bg-gray-300" />
                        <Text className="mx-4 text-gray-700 font-kenao">Or continue with</Text>
                        <View className="flex-1 h-px bg-gray-300" />
                    </View>

                    {/* Social buttons */}
                    <View className="space-y-4 mb-8">
                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center bg-white rounded-xl py-3 px-4"
                            onPress={() => console.log('Google sign up pressed')}
                            disabled={signupMutation.isPending}
                        >
                            <Ionicons name="logo-google" size={20} color="#DB4437" />
                            <Text className="ml-2 text-gray-700 font-kenao-medium text-sm">
                                Google
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center bg-black rounded-xl py-3 px-4"
                            onPress={() => console.log('Apple sign up pressed')}
                            disabled={signupMutation.isPending}
                        >
                            <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                            <Text className="ml-2 text-white font-kenao-medium text-sm">
                                Apple
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign in link */}
                    <View className="flex-row justify-center items-center mt-4 mb-12">
                        <Text className="text-gray-800 font-kenao text-sm">
                            Already have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={handleSignInNavigation} disabled={signupMutation.isPending}>
                            <Text className="text-white font-kenao-semibold text-sm underline">
                                Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function AxiosError(error: unknown): error is AxiosErrorType {
    return axios.isAxiosError(error);
}
