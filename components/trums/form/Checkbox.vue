<script setup lang="ts">
import { toRef, watch } from "vue";
import { useField } from "vee-validate";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Boolean,
    default: false, // Default value is false
  },
});

const name = toRef(props, "name");

const emit = defineEmits(["update:modelValue"]);

// Gunakan useField untuk pengelolaan nilai dan validasi checkbox
const {
  value: localValue,
  errorMessage,
  handleBlur,
  handleChange,
  meta,
} = useField(name, undefined, {
  initialValue: props.modelValue,
});

// Menangani perubahan nilai checkbox agar menjadi boolean
const handleCheckboxChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  // Pastikan nilai yang diteruskan adalah boolean (true/false)
  localValue.value = target.checked;
};

// Sinkronkan localValue dengan prop modelValue
watch(localValue, (newValue) => {
  emit("update:modelValue", newValue);
});
</script>

<template>
  <div
    class="relative mb-6 w-full"
    :class="{ 'has-error': !!errorMessage, success: meta.valid }"
  >
    <div class="flex items-center gap-1">
      <input
        :name="name"
        id="checkbox-single"
        type="checkbox"
        v-model="localValue"
        @blur="handleBlur"
        @change="handleCheckboxChange"
        class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      />
      <label
        :for="name"
        class="ms-2 text-lg font-medium text-gray-900 dark:text-gray-300"
      >
        {{ label }}
      </label>
    </div>
    <p
      v-if="errorMessage"
      class="absolute bottom-[-1.5em] left-0 text-sm text-red-500"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>
