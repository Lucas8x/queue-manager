import { onMounted, ref } from 'vue';

export function useColumnsSize() {
  const columns = ref(1);

  function updateColumns() {
    const width = window.innerWidth;

    if (width >= 1280) {
      columns.value = 4;
    } else if (width >= 1024) {
      columns.value = 3;
    } else if (width >= 768) {
      columns.value = 2;
    } else {
      columns.value = 1;
    }
  }

  onMounted(() => {
    updateColumns();
    window.addEventListener('resize', updateColumns);
  });

  return {
    columns,
  };
}
