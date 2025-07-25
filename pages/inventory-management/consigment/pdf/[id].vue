<template>
    <iframe id="pdf" width="100%" 
    height="600px" 
    style="border: none;" />
</template>
  
<script setup>
    definePageMeta({
    middleware: ["auth", "app"],
    layout: false,
  });
  import { useNuxtApp } from '#app';
  
  const { $pdf } = useNuxtApp()

  // Data contoh (ganti dengan data dinamis Anda)
  const customerData = {
    name: "Deepseek",
    phone: "3234243",
    email: "example@gmail.com"
  };

  const transactions = [
    { id: 1, sn: "1", name: "Laptop", quantity: 2, price: 10000000, total: 20000000 },
    { id: 2, sn: "2", name: "Mouse", quantity: 3, price: 200000, total: 600000 },
    { id: 3, sn: "3", name: "Keyboard", quantity: 1, price: 500000, total: 500000 }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  $pdf.new({
    plugins: [
        {
          page: [
            // simple counter footer
            ({ Text }, context, current, total) => {
              // render in every page
              Text(`${current}/${total}`, { fontSize: 20 }, {
                x: context.width / 2,
                y: context.height - context.margins.bottom
              })
            },
            // simple header
            ({ Text }, context, current, total) => {
              // render in every page
              Text('TRUMS-CONSIGNMENT', {}, {
                x: context.width / 2,
                y: context.margins.top - 20,
                align: 'center',
              })
            }
          ]
        }
      ],
      
  })

  
  
  $pdf.add([
    
    { raw: 'Nama: ' + customerData.name, text: {} },
    { raw: 'Email: ' + customerData.email, text: {} },
    { raw: 'Phone: ' + customerData.phone, text: {} },
    { lineBreak: {} },
    {
      table: {
        
        body: {
          title: "Daftar Item",
          headers: [ "Item", "SN", "Qty", "Price" , "Total"],
          rows: transactions.map((value) => ([value.name, value.sn, value.quantity, value.price, value.total])),
        },
        
      }
    }
  ]);

  
  
  $pdf.run().then(blob => {
    const iframe = document.querySelector('#pdf')
  
    iframe.src = blob
  }).catch((err) => {
    console.error(err)
  })
  </script>
  