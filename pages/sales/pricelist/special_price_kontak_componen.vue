<template>
  <el-autocomplete
    v-if="type == 'kontak'"
    v-model="model_search"
    :fetch-suggestions="querySearchContact"
    clearable
    class="inline-input w-50"
    placeholder="Cari Kontak"
    style="width: 200px"
    @select="onHandleSelectContact"
  />
  <el-autocomplete
    v-if="type == 'location'"
    v-model="model_search"
    :fetch-suggestions="querySearchLocation"
    clearable
    class="inline-input w-50"
    placeholder="Cari Lokasi"
    style="width: 200px"
    @select="onHandleSelectLocation"
  />
  
  <div class="flex gap-2 my-5">
    <el-tag v-for="tag in conditions" :key="tag.unique_id ?? ''" :disable-transitions="false" @close="handleCloseLocation(tag)" closable type="primary">
      {{ tag.value_display }}
    </el-tag>
  </div>
</template>
<script lang="tsx" setup>
import type { Catalogue } from '~/types/catalogue';
import type { Contact } from '~/types/contact';
import { OperationPriceTag, VariablePriceTag, type Pricetag_condition } from '~/types/pricetag';
import type { RequestSearch } from '~/types/request_search';
import type { ResponsePagination } from '~/types/response_pagination';

  const props = defineProps<{
      type: "kontak"|"location",
      conditions?: Pricetag_condition[],
  }>();

  const model_search = ref<string>('');

  const querySearchLocation = (queryString: string, cb: (arg: any) => void) => {
      const requestSearch: RequestSearch = {
        keyword: '',
        table: 'catalogues',
        column: [],
        sort: null,
        limit: '10',
        offset: '1',
    }
    requestSearch.keyword = queryString;
    requestSearch.table = 'catalogues';
    requestSearch.column = [
        {
            "type": ['place']
        }
    ]
      
      useFetchApi<ResponsePagination<Catalogue[]>>('/search', 'location_search', 'post', requestSearch).then((response) => {
          if(response.status.value == 'success'){
              
              const resultApi: Catalogue[]  = response.data.value?.data!;
              
              if(resultApi.length > 0){
                  cb(resultApi.map((value) => ({...value, value: value.name})));
              }else{
                  cb([{value: `Tambahkan ${queryString}`, new: true, unique_id: `${queryString}`}]);
              }
          }
      })

  }

  const handleCloseContact = (tag: Contact) => {
    // props.contacts?.splice(props.contacts.indexOf(tag), 1)
  }
  const handleCloseLocation = (tag: Pricetag_condition) => {
    props.conditions?.splice(props.conditions.indexOf(tag), 1)
    // console.log(tag);
  }

  const querySearchContact = (queryString: string, cb: (arg: any) => void) => {
      const requestSearch: RequestSearch = {
        keyword: '',
        table: 'contacts',
        column: [],
        sort: null,
        limit: '10',
        offset: '1',
    }
    requestSearch.keyword = queryString;
   
      
      useFetchApi<ResponsePagination<Catalogue[]>>('/search', 'contact_search', 'post', requestSearch).then((response) => {
          if(response.status.value == 'success'){
              
              const resultApi: Catalogue[]  = response.data.value?.data!;
              
              if(resultApi.length > 0){
                  cb(resultApi.map((value) => ({...value, value: value.name})));
              }else{
                  cb([{value: `Tambahkan ${queryString}`, new: true, unique_id: `${queryString}`}]);
              }
          }
      })

  }

  const onHandleSelectContact = (record: Record<string, any>) => {
    model_search.value = '';
    const contact: Contact = record as Contact;
    props.conditions?.push({
      unique_id: null,
      tag_id: null,
      value: contact.unique_id!,
      variable: VariablePriceTag.KONTAK,
      value_display: contact.name,
      variable_pricetag: {
        unique_id: '',
        name: VariablePriceTag.KONTAK,
        type: 'variable',
        slug: ''
      },
      operation_pricetag: {
        unique_id: '',
        name: OperationPriceTag.IS_EQUAL,
        type: 'operation',
        slug: ''
      },
      operation: OperationPriceTag.IS_EQUAL,
    });
  }
  const onHandleSelectLocation = (record: Record<string, any>) => {
    const location: Catalogue = record as Catalogue;
    props.conditions?.push({
      unique_id: null,
      tag_id: null,
      value: location.unique_id!,
      value_display: location.name ?? '',
      variable: VariablePriceTag.LOCATION,
      operation: OperationPriceTag.IS_EQUAL,
      variable_pricetag: {
        unique_id: '',
        name: VariablePriceTag.LOCATION,
        type: 'variable',
        slug: ''
      },
      operation_pricetag: {
        unique_id: '',
        name: OperationPriceTag.IS_EQUAL,
        type: 'operation',
        slug: ''
      },
    });
  }

</script>