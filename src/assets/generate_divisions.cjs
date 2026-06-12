const fs = require('fs');
const path = require('path');

const vnData = JSON.parse(fs.readFileSync(path.join(__dirname, 'vn.json'), 'utf8'));

const provinceOptions = [];
const districtWardMap = {};

for (const province of vnData) {
  provinceOptions.push({
    value: province.FullName,
    label: province.FullName
  });

  const wards = province.Wards || [];
  districtWardMap[province.FullName] = wards.map(w => w.FullName);
}

const fileContent = `// Tự động sinh từ dữ liệu vn.json
export const PROVINCE_OPTIONS = ${JSON.stringify(provinceOptions, null, 2)};

export const DISTRICT_WARD_MAP: Record<string, string[]> = ${JSON.stringify(districtWardMap, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'vietnam_divisions.ts'), fileContent, 'utf8');
console.log('Successfully generated vietnam_divisions.ts');
