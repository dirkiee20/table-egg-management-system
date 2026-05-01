import sys

file_path = 'd:/table-egg-management-system/frontend/src/pages/DailyEggProduction.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Replace the sizePayload calculation
old_payload = """      const sizePayload = SIZE_FIELDS.reduce((payload, field) => {
        payload[field] = parseWholeNumber(formData[field]) * EGGS_PER_TRAY;
        return payload;
      }, {});"""

new_payload = """      const sizePayload = SIZE_FIELDS.reduce((payload, field) => {
        payload[field] = (parseWholeNumber(formData[`${field}_trays`]) * EGGS_PER_TRAY) + parseWholeNumber(formData[`${field}_odd`]);
        return payload;
      }, {});"""

content = content.replace(old_payload, new_payload)

# Replace the api.production.create call
old_create = """      await api.production.create({
        date: formData.date,
        flockId: formData.flockId,
        ...sizePayload,
        bunkig: oddEggs,
        cracked: crackedVal,
        reject: rejectVal,
        mortality: 0,
        notes: formData.remarks
      });"""

new_create = """      await api.production.create({
        date: formData.date,
        flockId: formData.flockId,
        ...sizePayload,
        bunkig: 0,
        cracked: crackedVal,
        reject: rejectVal,
        mortality: 0,
        notes: formData.remarks
      });"""

content = content.replace(old_create, new_create)

# Replace the setFormData reset
old_reset = """      setFormData(prev => ({
        ...prev,
        jumbo: '',
        extralarge: '',
        large: '',
        medium: '',
        small: '',
        peewee: '',
        bunkig: '',
        cracked: '',
        reject: '',
        remarks: ''
      }));"""

new_reset = """      setFormData(prev => ({
        ...prev,
        jumbo_trays: '', jumbo_odd: '',
        extralarge_trays: '', extralarge_odd: '',
        large_trays: '', large_odd: '',
        medium_trays: '', medium_odd: '',
        small_trays: '', small_odd: '',
        peewee_trays: '', peewee_odd: '',
        cracked: '',
        reject: '',
        remarks: ''
      }));"""

content = content.replace(old_reset, new_reset)

with open(file_path, 'w') as f:
    f.write(content)
