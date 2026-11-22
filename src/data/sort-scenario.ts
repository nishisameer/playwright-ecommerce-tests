

export const sortCases = [
  { label: 'name A to Z',        option: 'name,asc',   field: 'name',  direction: 'asc'  },
  { label: 'name Z to A',        option: 'name,desc',  field: 'name',  direction: 'desc' },
  { label: 'price low to high',  option: 'price,asc',  field: 'price', direction: 'asc'  },
  { label: 'price high to low',  option: 'price,desc', field: 'price', direction: 'desc' },
] as const;