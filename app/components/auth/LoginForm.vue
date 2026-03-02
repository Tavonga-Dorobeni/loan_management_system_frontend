<script setup lang="ts">
import { useForm } from 'vee-validate';

import { loginSchema } from '~/app/utils/validation';

const emit = defineEmits<{
  submitted: [values: { email: string; password: string }];
}>();

const { defineField, handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: loginSchema,
  initialValues: {
    email: '',
    password: ''
  }
});

const [email] = defineField('email');
const [password] = defineField('password');

const onSubmit = handleSubmit(async (values) => {
  emit('submitted', values);
});
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <UiInput v-model="email" name="email" label="Email" type="email" placeholder="you@example.com" :error="errors.email" />
    <UiInput v-model="password" name="password" label="Password" type="password" placeholder="Enter your password" :error="errors.password" />
    <UiButton type="submit" block :disabled="isSubmitting">Sign in</UiButton>
  </form>
</template>
