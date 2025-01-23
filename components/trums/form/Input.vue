<script setup lang="ts">
import { toRef } from "vue";
import { useField } from "vee-validate";

const props = defineProps({
  type: {
    type: String,
    default: "text",
  },
  name: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    default: "",
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: "",
  },
  multiline: {
    type: Boolean,
    default: false,
  },
});

const name = toRef(props, "name");

const {
  value: inputValue,
  errorMessage,
  handleBlur,
  handleChange,
  meta,
} = useField(name, undefined, {
  initialValue: props.value,
});
</script>

<template>
  <div
    class="relative mb-6 w-full"
    :class="{ 'has-error': !!errorMessage, success: meta.valid }"
  >
    <label
      :for="name"
      class="block mb-1 text-md font-medium text-gray-700 dark:text-white"
    >
      {{ label }}
    </label>

    <!-- Gunakan textarea jika multiline true, input jika false -->
    <component
      :is="multiline ? 'textarea' : 'input'"
      :name="name"
      :id="name"
      :type="!multiline ? type : undefined"
      v-model="inputValue"
      :placeholder="placeholder"
      class="w-full rounded-md border-2 px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
      :class="{
        '': !errorMessage && !meta.valid,
        'border-red-500 bg-red-50 text-red-700': errorMessage,
        'border-green-500 bg-green-50 text-green-700': meta.valid,
        'h-[150px]': multiline,
      }"
      @input="handleChange"
      @blur="handleBlur"
    ></component>

    <p
      class="absolute bottom-[-1.5em] left-0 text-sm"
      :class="{
        'text-red-500': errorMessage,
      }"
      v-show="errorMessage"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>
