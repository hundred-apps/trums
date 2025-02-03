<template>
  <el-page-header @back="goBack">
      <template #content>
          <span class="text-large font-600 mr-3"> New Maintenance </span>
      </template>
  </el-page-header>
  <el-card class="my-3">
    <template #header>
        <div class="card-header">
            <el-form-item>
                <el-button type="primary" @click="submitForm(ruleFormRef)">
                    Simpan
                </el-button>
                <el-button @click="resetForm(ruleFormRef)">Reset</el-button>
            </el-form-item>
        </div>
    </template>
    <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="ruleForm"
        :rules="rules"
        label-width="auto"
        class="demo-ruleForm"
        size="default"
        status-icon
    >
        <el-form-item label="Item" prop="inspection_item_name">
          <el-autocomplete
              :fetch-suggestions="querySearchAsyncItem"
              v-model="ruleForm.inspection_item_name"
              placeholder="Search Item"
              @select="onHandleSelectItemAutocomplete"
          />
        </el-form-item>
        <el-form-item label="Penganggung Jawab" prop="responsible_name">
          <el-autocomplete
              :fetch-suggestions="querySearchAsyncPic"
              v-model="ruleForm.responsible_name"
              placeholder="Search People"
              @select="onHandleSelectPICAutocomplete"
          />
        </el-form-item>
        <el-form-item label="Tanggal Maintanance" prop="maintenance_date">
          <el-date-picker
              v-model="ruleForm.maintenance_date"
              type="date"
              placeholder="Tanggal Maintenance"
          />
        </el-form-item>  
        <el-form-item label="Tanggal Mulai" prop="start_date">
          <el-date-picker
              v-model="ruleForm.start_date"
              type="date"
              placeholder="Tanggal Mulai"
          />
        </el-form-item>  
        <el-form-item label="Tanggal Selesai" prop="end_date">
          <el-date-picker
              v-model="ruleForm.end_date"
              type="date"
              placeholder="Tanggal Selesai"
          />
        </el-form-item>  
        <el-form-item label="Berulang" prop="is_repeate">
          <el-switch v-model="ruleForm.is_repeate" />
        </el-form-item>
        <el-form-item label="Periode Pengulangan" prop="count">
          <el-select-v2
            placeholder="Periode"
            v-model="ruleForm.repeate_option"
            :options="[
              {value: '7H', label: '7 Hari'},
              {value: '1B', label: '1 Bulan'},
              {value: '3B', label: '3 Bulan'},
              {value: '6B', label: '6 Bulan'},
              {value: '1T', label: '1 Tahun'}
            ]"
            @change="onChangePriode"
          />
        </el-form-item>
        
        <el-form-item label="Prioritas" label-position="right">
          <el-radio-group v-model="ruleForm.priority" aria-label="Prioritas">
            <el-radio-button value="low">Low</el-radio-button>
            <el-radio-button value="medium">Medium</el-radio-button>
            <el-radio-button value="hight">Hight</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Type Maintenance" label-position="right">
          <el-radio-group v-model="ruleForm.type" aria-label="Type Maintenance">
            <el-radio-button value="corrective">Corrective</el-radio-button>
            <el-radio-button value="preventive">Preventive</el-radio-button>
          </el-radio-group>
        </el-form-item>
    </el-form>
  </el-card>
</template>
<script lang="tsx" setup>
import type { FormInstance, FormRules } from 'element-plus';
import type { Catalogue } from '~/types/catalogue';
import type { People } from '~/types/people';

  interface RuleForm {
    inspection_item_name: string,
    inspection_item_id: number,
    maintenance_date: string,
    team_id: string,
    responsible_id: string,
    responsible_name: string,
    start_date: string,
    end_date: string,
    is_repeate: boolean,
    repeate_unit: string,
    repeate_value: number,
    priority: string,
    status: string,
    type: string,
    repeate_option: string,
  }
  definePageMeta({
      middleware:['auth', 'app'],
      name: "New Maintenance",
  })

  const router = useRouter();

  const goBack = () => router.back();
  const axios = useApi();

  const ruleFormRef = ref<FormInstance>()
  const ruleForm = reactive<RuleForm>({
    inspection_item_name: '',
    inspection_item_id: 0,
    maintenance_date: '',
    team_id: '',
    responsible_id: '',
    start_date: '',
    end_date: '',
    is_repeate: false,
    repeate_unit: 'hari',
    repeate_value: 7,
    priority: 'low',
    status: 'draft',
    type: 'corrective',
    responsible_name: '',
    repeate_option: '7H'
  })

  // const validateRepeateUnit = (rule: any, value: any, callback: any) => {
  //   if(ruleForm.is_repeate){
  //     if (value === '') {
  //       callback(new Error('Masukan Unit Pengulangan'))
  //     }else {
  //       callback()
  //     }
  //   }else{
  //     callback()
  //   }
  // }

  // const validateRepeateValue = (rule: any, value: any, callback: any) => {
  //   if(ruleForm.is_repeate){
  //     if (value === '') {
  //       callback(new Error('Masukan Unit Pengulangan'))
  //     }else {
  //       callback()
  //     }
  //   }else{
  //     callback()
  //   }
  // }

  const rules = reactive<FormRules<RuleForm>>({
    maintenance_date: [
        { type: "date", required: true, message: 'Tanggal Maintenance', trigger: 'change' },
    ],
    inspection_item_name: [
      { required: true, message: 'Item Maintenance', trigger: 'blur' },
    ],
    inspection_item_id: [
      { required: true, message: 'Item Maintenance', trigger: 'blur' },
    ],
    start_date: [
      {
        type: 'date',
        required: true,
        message: 'Tanggal Mulai Maintenance',
        trigger: 'change',
      },
    ],
    end_date: [
      {
        type: 'date',
        required: true,
        message: 'Tanggal Mulai Maintenance',
        trigger: 'change',
      },
    ],
    responsible_name: [
      { required: true, message: 'Penanggung Jawab', trigger: 'blur' },
    ],
    
  })

  const submitForm = async (formEl: FormInstance | undefined) => {
      if (!formEl) return
      await formEl.validate((valid, fields) => {
          if (valid) {
            console.log('submit!')
            console.log(ruleFormRef.value);
          } else {
            console.log('error submit!', fields)
          }
      })
  }
  

  const resetForm = (formEl: FormInstance | undefined) => {
      if (!formEl) return
      formEl.resetFields()
  }

  const querySearchAsyncPic = (queryString: string, cb: (arg: any) => void) => {
      axios.get('/people-read').then((response) => {
          if(response.status == 200){
              // console.log(response.data.data.q);
              const peoples: People[] = response.data.data;

              const filters = queryString
              ? peoples.filter(
                  (data) => 
                  data.name?.toLowerCase().includes(queryString.toLowerCase()) ||
                  data.email?.toLowerCase().includes(queryString.toLowerCase()) ||
                  data.position?.toLowerCase().includes(queryString.toLowerCase())
              )
              : peoples

              const results = filters.map((data: People) => {
                          return {value: `${data.name}`, id: data.unique_id};
              });
              cb(results)
          }else{
              ElMessage.error(response.data.message);
          }
      }).catch((error: any) => {
          ElMessage.error(error.response.data.message);
      });
    }

    const querySearchAsyncItem = (queryString: string, cb: (arg: any) => void) => {
      axios.get('/catalogues-read').then((response) => {
          if(response.status == 200){
              // console.log(response.data.data.q);
              const catalogues: Catalogue[] = response.data.data.query;

              const filters = queryString
              ? catalogues.filter(
                  (data) => 
                  data.name?.toLowerCase().includes(queryString.toLowerCase()) ||
                  data.sn?.toLowerCase().includes(queryString.toLowerCase())
              )
              : catalogues

              const results = catalogues.map((data: Catalogue) => {
                  return {value: `${data.name}-${data.sn}`, unique_id: data.unique_id};
              });    
              cb(results)
          }else{
              ElMessage.error(response.data.message);
          }
      }).catch((error: any) => {
          ElMessage.error(error.response.data.message);
      });
  }

  const onHandleSelectItemAutocomplete = (item: Record<string, any>) => {
    console.log(item)
    ruleForm.inspection_item_name = item.value;
    ruleForm.inspection_item_id = item.unique_id;
  }
  const onHandleSelectPICAutocomplete = (item: Record<string, any>) => {
    console.log(item)
    ruleForm.responsible_name = item.value;
    ruleForm.responsible_id = item.unique_id;
  }

  const onChangePriode = (value: string) => {
    if( value == '7H'){
      ruleForm.repeate_unit = 'hari';
      ruleForm.repeate_value = 7;
    }
    else if( value == '1B'){
      ruleForm.repeate_unit = 'bulan';
      ruleForm.repeate_value = 1;
    }
    else if( value == '3B'){
      ruleForm.repeate_unit = 'bulan';
      ruleForm.repeate_value = 3;
    }
    else if( value == '6B'){
      ruleForm.repeate_unit = 'bulan';
      ruleForm.repeate_value = 6;
    }
    else if( value == '1T'){
      ruleForm.repeate_unit = 'tahun';
      ruleForm.repeate_value = 1;
    }
  }

</script>