import { View, Image, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Controller, useForm } from "react-hook-form";
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError as AxiosErrorType, isAxiosError } from 'axios';
import { toast } from 'sonner-native';
import * as SecureStore from "expo-secure-store"
import { storeAccessToken } from "@/lib/utils";
import useSocialAuth from "@/hooks/useSocialAuth";

interface LoginFormData {
    email: string;
    password: string;
}
const loginUser = async (userData: LoginFormData) => {
    try {
        const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/api/login`,
            userData
        );
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            //Handle Axios Specific errors
            if (!error.response) {
                throw new Error('Network error. Please check your connection.');
            }

            const status = error.response.status;
            const errorData = error.response.data;
            const message = (errorData as { message?: string })?.message;

            if (status === 400 || status === 422) {
                throw new Error(errorData?.message ? errorData?.message : "Invalid input data");
            } else if (status === 401) {
                throw new Error(
                    errorData?.message || 'Invalid credentials. Please check your credentials and try again.');
            } else if (status === 404) {
                throw new Error(
                    errorData?.message || 'Account not found');
            } else if (status === 429) {
                throw new Error(
                    errorData?.message || 'Too many requests. Please try again later.');
            } else if (status >= 500) {
                throw new Error(
                    errorData?.message || 'Server error. Please try again later.');
            } else {
                throw new Error(errorData?.message || "Login Failed")
            }
            throw new Error('Something went wrong. Please try again.');
        }
    }
};
export default function LoginScreen() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { loadingStrategy, handleSocialAuth } = useSocialAuth();

    const loginForm = useForm<LoginFormData>({
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onLoginSubmit = (data: LoginFormData) => {
        loginMutation.mutate(data);
    }

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: async (data) => {
            toast.success("Login Successful! Welcome Back")

            const user = {
                id: data?.user?.id,
                name: data?.user?.name,
                email: data?.user?.email,
                avatar: data?.user?.avatar,
            };

            await SecureStore.setItemAsync("user", JSON.stringify(user));

            if (data?.accessToken) {
                await storeAccessToken(data.accessToken);
            }
            router.replace("/(customer-tabs)");

            if (data?.refreshToken) {
                await SecureStore.setItemAsync("refresh_token", data.refreshToken);
            }
        }
    })
    const handleSignUpNavigation = () => {
        router.push("../signup");
    }
    return (
        <SafeAreaView className='flex-1 bg-[#8264A9]'>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className='flex-1'>
                <ScrollView
                    className="flex-1 px-6"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="mt-16 mb-8">
                        <Text className="text-3xl font-kenao text-gray-800 mb-2">
                            Welcome Back
                        </Text>
                        <Text className="text-gray-500 text-base font-kenao">
                            Sign in to your Account
                        </Text>
                    </View>
                    {/* Form Fields*/}
                    <View className="gap-6 mt-8">
                        {/* Email Field */}
                        <View className="mt-6">
                            <Text className="text-gray-800 text-base font-kenao mb-3">Email</Text>
                            <Controller
                                control={loginForm.control}
                                name="email"
                                rules={{
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^@]+@[^@]+\.[^@]+$/,
                                        message: "Please enter a valid Email"
                                    }
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View
                                        className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-4 ${loginForm.formState.errors.email
                                            ? "border-red-500"
                                            : "border-gray-200"
                                            }`} >

                                        <MaterialCommunityIcons
                                            name="email-outline"
                                            size={20}
                                            color={"4F2B50"}
                                        />
                                        <TextInput
                                            className="flex-1 ml-3 text-gray-800 font-kenao"
                                            placeholder="Enter your Email Address"
                                            placeholderTextColor="#0b010b"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            editable={!loginMutation.isPending}
                                        />
                                        {loginForm.formState.errors.email && (
                                            <Text className="text-red-500 text-sm font-kenao mt-1">
                                                {loginForm.formState.errors.email.message}
                                            </Text>
                                        )}
                                    </View>
                                )}

                            />
                        </View>

                        {/* Password Fields */}
                        <View className="mt-6">
                            <Text className="text-gray-800 text-base font-kenao mb-3">
                                Password
                            </Text>
                            <Controller
                                control={loginForm.control}
                                name="password"
                                rules={{
                                    required: "Password is required",
                                    pattern: {
                                        value: /^[^@]+@[^@]+\.[^@]+$/,
                                        message: "Please enter a valid Email"
                                    }
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View
                                        className={`flex-row items-center bg-gray-50 border rounded-xl px-4 py-4 ${loginForm.formState.errors.password
                                            ? "border-red-500"
                                            : "border-gray-200"
                                            }`} >

                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={20}
                                            color={"#4F2B50"}
                                        />
                                        <TextInput
                                            className="flex-1 ml-3 text-gray-800 font-kenao"
                                            placeholder="Enter your Password"
                                            placeholderTextColor="#0b010b"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            secureTextEntry={!showPassword}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            editable={!loginMutation.isPending}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                        >
                                            <Ionicons
                                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                                size={20}
                                                color={"#4F2B50"}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                            {loginForm.formState.errors.password && (
                                <Text className="text-red-500 text-sm font-kenao mt-1">
                                    {loginForm.formState.errors.password.message}
                                </Text>
                            )}
                        </View>
                        {/* Forgot Password */}
                        <TouchableOpacity className="self-end mt-2" onPress={() => router.push("../forgot-password")}
                            disabled={loginMutation.isPending}
                        >
                            <Text className='text-[#8264A9] font-kenao'>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        className={`rounded-xl py-4 mt-8 ${loginForm.formState.isValid ? "bg-[#8264A9]" : "bg-gray-400"}`}
                        onPress={loginForm.handleSubmit(onLoginSubmit)}
                        disabled={!loginForm.formState.isValid || loginMutation.isPending}
                    >
                        <Text className="text-white text-center text-lg font-kenao">
                            {loginMutation.isPending ? "Signing In as Vendor ..." : "Sign In"}
                        </Text>
                    </TouchableOpacity>
                    {/* Divider */}

                    <View className='flex-row items-center my-8'>
                        <View className='flex-1 h-px bg-gray-300' />
                        <Text className="mx-4 text-gray-500 font-kenao font-kenao">
                            Or using other method
                        </Text>

                        <View className="flex-row justify-center gap-4 mb-8">
                            {/* Google Login Button */}
                            <TouchableOpacity
                                className="w-6 h-6 mr-3"
                                onPress={() => handleSocialAuth("oauth_google")}
                                disabled={loginMutation.isPending || loadingStrategy !== null}
                            >
                                <Ionicons name="logo-google" size={20} color="#4F2B50" />
                                <Text className="ml-2 text-gray-700 font-kenao-medium text-sm">
                                    Google
                                </Text>
                            </TouchableOpacity>

                            {/* Apple Login Button */}
                            <TouchableOpacity
                                className="flex-1 flex-row items-center justify-center bg-black rounded-xl py-3 px-4"
                                onPress={() => handleSocialAuth("oauth_apple")}
                                disabled={loginMutation.isPending || loadingStrategy !== null}
                            >
                                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                                <Text className="ml-2 text-white font-kenao-medium text-sm">
                                    Apple
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Sign Up Redirect Link */}
                        <View className="flex-row justify-center items-center mt-4 mb-12">
                            <Text className="text-gray-600 font-kenao text-sm">
                                Don&apos;t have an Account?{" "}
                            </Text>
                            <TouchableOpacity
                                onPress={handleSignUpNavigation}
                                disabled={loginMutation.isPending}
                            >
                                <Text className="text-[#8264A9] font-kenao-semibold text-sm underline">
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};