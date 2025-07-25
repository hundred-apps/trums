<template>
    
    <TrumsWrapper v-if="loading"></TrumsWrapper>
    <TrumsWrapper v-if="!loading">
        <el-page-header @back="goBack">
            <template #content>
                <span class="text-large font-600 mr-3"> Consigment </span>
            </template>
        </el-page-header>
        <el-card class="my-5">
            <el-form :model="ruleFormFilter" class="ml-3" label-width="auto" style="max-width: 600px">
                <el-form-item label="Pilih Tanggal">
                    <el-date-picker
                    v-model="ruleFormFilter.date_range"
                    type="daterange"
                    unlink-panels
                    range-separator="To"
                    start-placeholder="Start date"
                    end-placeholder="End date"
                    :shortcuts="shortcutsDate"
                    size="default"
                    @change="setTabView"
                    />
                </el-form-item>
            </el-form>
        </el-card>
        <el-tabs
        v-if="!loading"
            v-model="activeName"
            editable
            type="border-card"
            class="demo-tabs my-5"
            @edit="handleTabsEdit"
            @tab-click="handleClick"
        >
            <el-tab-pane v-for="tab in customTabs" :key="tab.key" :label="tab.title" :name="tab.name">
                <ConsigmentView :data="tab.data"/>
            </el-tab-pane>
        </el-tabs>
    </TrumsWrapper>
</template>

<script lang="tsx" setup>
    import type { TabPaneName, TabsPaneContext } from 'element-plus'
    import type { Consigment } from '~/types/consignment'
    import ConsigmentView from '~/components/trums/ConsigmentView.vue'
import type { ResponsePagination } from '~/types/response_pagination'

    definePageMeta({
        middleware:['auth', 'app'],
        name: "Trums Conssigment",
    })

    interface TabViewInterface {
        title: string,
        name: string,
        key: string,
        data: Consigment
    }

    interface FormFilter {
        date_range: string[],
    }

    const ruleFormFilter = reactive<FormFilter>({
        date_range: ["", ""],
    });

    const activeName = ref('first')
    const customTabs = ref<TabViewInterface[]>([]);
    const loading = ref<boolean>(false);

    const router = useRouter();
    const goBack = () => router.back();

    const handleClick = (tab: TabsPaneContext, event: Event) => {
        console.log(tab, event)
    }

    const handleTabsEdit = (
        targetName: TabPaneName | undefined,
        action: 'remove' | 'add'
    ) => {
         if (action === 'remove') {
            const tabs = customTabs.value
            let activeTab = activeName.value
            if (activeTab === targetName) {
                tabs.forEach((tab, index) => {
                    if (tab.name === targetName) {
                        const nextTab = tabs[index + 1] || tabs[index - 1]
                        if (nextTab) {
                            activeTab = nextTab.name
                        }
                    }
                })
            }

            activeName.value = activeTab
            customTabs.value = tabs.filter((tab) => tab.name !== targetName)
        }
    }

    const setTabView = async (ranges: string[]) => {
        loading.value = true;
      

        try{

            const start = new Date(ranges[0]).getTime() / 1000;
            const end = new Date(ranges[1]).getTime() / 1000;

            const data = {
                start_date: start,
                end_date: end,
            }

            const response = await useFetchApi<ResponsePagination<Consigment[]>>('/inventory-movement', 'movement', 'post', data)

            if(response.status.value == 'success'){
                const consignments: Consigment[] = (response.data.value as ResponsePagination<Consigment[]>).data;
                // consignments.forEach((data, index) => {

                // });

                
                customTabs.value = consignments.map((data) => ({data: data, key: data.contact_id,name: data.contact_id,title: data.contact_name }))
                
                activeName.value = customTabs.value[0].name;
            }
            
        } catch (error: any) {
            ElMessage.error(`${error.response?.data?.message ?? error}`);
        } finally {
            loading.value = false;
        }

        
        
    }

    const shortcutsDate = [
        {
        text: 'Last week',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            return [start, end]
        },
        },
        {
        text: 'Last month',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            return [start, end]
        },
        },
        {
        text: 'Last 3 months',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            return [start, end]
        },
        },
    ]

    onMounted(() => {
        // setTabView();
    })

</script>