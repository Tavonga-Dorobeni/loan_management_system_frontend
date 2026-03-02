<script setup lang="ts">
import { useForm } from 'vee-validate';

import { registrationSchema } from '~/app/utils/validation';

const emit = defineEmits<{
  submitted: [values: { firstName: string; lastName: string; email: string; password: string }];
}>();

const { defineField, handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: registrationSchema,
  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  }
});

const [firstName] = defineField('firstName');
const [lastName] = defineField('lastName');
const [email] = defineField('email');
const [password] = defineField('password');

const onSubmit = handleSubmit(async (values) => {
  emit('submitted', values);
});
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <UiInput v-model="firstName" name="firstName" label="First name" :error="errors.firstName" />
      <UiInput v-model="lastName" name="lastName" label="Last name" :error="errors.lastName" />
    </div>
    <UiInput v-model="email" name="email" label="Email" type="email" :error="errors.email" />
    <UiInput v-model="password" name="password" label="Password" type="password" :error="errors.password" />
    <UiButton type="submit" block :disabled="isSubmitting">Create account</UiButton>
  </form>
</template>
