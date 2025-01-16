<script setup lang="ts">
import { toRef } from "vue";
import { useField } from "vee-validate";

const props = defineProps({
  type: {
    type: String,
    default: "text",
  },
  value: {
    type: String,
    default: undefined,
  },
  name: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  successMessage: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
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
    <input
      :name="name"
      :id="name"
      :type="type"
      :value="inputValue"
      :placeholder="placeholder"
      class="w-full rounded-md border-2 px-4 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:placeholder-gray-400 dark:focus:ring-primary-500 dark:focus:border-primary-500"
      :class="{
        '': !errorMessage && !meta.valid,
        'border-red-500 bg-red-50 text-red-700': errorMessage,
        'border-green-500 bg-green-50 text-green-700': meta.valid,
      }"
      @input="handleChange"
      @blur="handleBlur"
    />

    <p
      class="absolute bottom-[-1.5em] left-0 text-sm"
      :class="{
        'text-red-500': errorMessage,
        'text-green-500': !errorMessage && meta.valid,
      }"
      v-show="errorMessage || meta.valid"
    >
      {{ errorMessage || successMessage }}
    </p>
  </div>
</template>
