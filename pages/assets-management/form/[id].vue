<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Form, useForm } from "vee-validate";
import * as yup from "yup";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { useApi } from "~/composables/useApi";

const route = useRoute();
const ids = route.params.id;
const mode = route.query.mode;
const unique_id = route.query.unique_id;

const assets = ref({});

if (mode === "update") {
  const fetchData = async () => {
    try {
      const response = await api.get(`/catalogues-read/${unique_id}`);
      assets.value = response.data.data;
    } catch (error) {
      console.error("Gagal memuat postingan:", error);
    }
  };
}

const api = useApi();

const schema = yup.object({
  unique_code: yup.string().required(t("form.validate.required")),
  name: yup.string().required(t("form.validate.required")),
  brand_id: yup.number().required(t("form.validate.required")),
  year: yup.number().required(t("form.validate.required")),
  sn: yup.number().required(t("form.validate.required")),
  berat: yup.number().required(t("form.validate.required")),
  volume: yup.number().required(t("form.validate.required")),
  description: yup.string().required(t("form.validate.required")),
});

const { handleSubmit, reset, setErrors, values } = useForm({
  validationSchema: schema,
});

const files = ref([]);
const fileInputRef = ref(null);

const processFiles = (uploadedFiles) => {
  for (const file of uploadedFiles) {
    // Cek apakah file sudah ada di daftar (untuk mencegah duplikasi)
    if (!files.value.find((f) => f.name === file.name)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        files.value.push({
          file,
          name: file.name,
          preview: e.target.result, // URL base64
        });
      };
      reader.readAsDataURL(file);
    }
  }
};

const handleFileChange = (event) => {
  processFiles(event.target.files);
};

const handleFileDrop = (event) => {
  event.preventDefault();
  processFiles(event.dataTransfer.files);
};

const handleDragOver = (event) => {
  event.preventDefault();
};

const openFileDialog = () => {
  fileInputRef.value.click();
};

const removeFile = (index) => {
  files.value.splice(index, 1);
};

const onSubmit = (values) => {
  const formData = new FormData();

  // Tambahkan nilai form ke FormData
  formData.append("unique_code", values.unique_code);
  formData.append("name", values.name);
  formData.append("brand_id", values.brand_id);
  formData.append("year", values.year);
  formData.append("sn", values.sn);
  formData.append("berat", values.berat);
  formData.append("volume", values.volume);
  formData.append("description", values.description);

  // Tambahkan file ke FormData
  files.value.forEach((file) => {
    formData.append("files[]", file.file); // Menggunakan 'files[]' untuk array file
  });

  // Kirim data ke API
  api
    .post("/catalogues-create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      console.log("Data berhasil dikirim!", response);
    })
    .catch((error) => {
      console.error("Error mengirim data", error);
      console.log("Terjadi kesalahan saat mengirim data.");
    });
};
if (mode === "update") {
  onMounted(async () => {
    await fetchData();
  });
}
</script>

<template>
  <TrumsWrapper class="flex flex-col gap-4">
    <h1 class="text-2xl text-gray-700 dark:text-white">
      {{ ids === "new" ? "Tambah Asset" : "Edit Asset" }}
    </h1>

    <Form :validation-schema="schema" @submit="onSubmit" class="flex flex-col">
      <div class="flex justify-between items-center gap-4">
        <TrumsFormInput
          name="unique_code"
          type="text"
          label="Unique Code"
          placeholder="Unique Code"
          success-message="Nice Code!"
        />
        <TrumsFormInput
          name="name"
          type="text"
          label="Name Asset"
          placeholder="Name Asset"
          success-message="Nice Name!"
        />
      </div>
      <div class="flex justify-between items-center gap-4">
        <TrumsFormInput
          name="brand_id"
          type="number"
          label="Brand ID"
          placeholder="Brand id"
          success-message="Nice Brand!"
        />
        <TrumsFormInput
          name="year"
          type="number"
          label="Year Asset"
          placeholder="1998"
          success-message="Nice Year!"
        />
      </div>
      <div class="flex justify-between items-center gap-4">
        <TrumsFormInput
          name="sn"
          type="number"
          label="Serial Number"
          placeholder="Serial Number"
          success-message="Nice Serial Number!"
        />
        <TrumsFormInput
          name="berat"
          type="number"
          label="Weight Asset"
          placeholder="1"
          success-message="Nice Weight!"
        />
        <TrumsFormInput
          name="volume"
          type="number"
          label="Volume Asset"
          placeholder="1"
          success-message="Nice Volume!"
        />
      </div>
      <TrumsFormInput
        name="description"
        type="text"
        label="Description"
        placeholder=""
      />

      <div
        class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
        @click="openFileDialog"
        @dragover="handleDragOver"
        @drop="handleFileDrop"
      >
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span class="font-semibold">Drag and drop</span> or click to upload
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            SVG, PNG, JPG or GIF
          </p>
        </div>
        <input
          id="dropzone-file"
          name="files[]"
          type="file"
          class="hidden"
          ref="fileInputRef"
          accept="image/*"
          multiple
          @change="handleFileChange"
        />
      </div>
      <h2 class="text-lg font-medium">Preview:</h2>

      <div v-if="files.length > 0" class="mt-4">
        <div class="grid grid-cols-6 gap-4 mt-2">
          <div
            v-for="(file, index) in files"
            :key="file.name"
            class="relative border rounded-lg p-2"
          >
            <img
              :src="file.preview"
              :alt="file.name"
              class="w-auto h-[100px] mx-auto object-contain rounded-lg"
            />
            <p class="mt-2 text-sm text-center truncate">{{ file.name }}</p>
            <button
              class="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
              @click="removeFile(index)"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
      <button type="submit">Submit</button>
    </Form>
  </TrumsWrapper>
</template>
