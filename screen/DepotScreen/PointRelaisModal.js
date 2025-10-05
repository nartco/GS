// ParcelShopModal.js
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';

import axiosInstance from '../../axiosInstance';
import { savePointRelaisChoice } from '../../modules/GestionStorage';
import { Picker } from "@react-native-picker/picker";

import { useFocusEffect } from '@react-navigation/native';


const COUNTRY_OPTIONS = [
  { label: 'France', value: 'FR' },
  { label: 'Belgique', value: 'BE' },
  { label: 'Allemagne', value: 'DE' },
];

const chunkBy = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

export default function PointRelaisModal({
  visible,
  onRequestClose,
  pointBaseUri,
  language = 'fr',
  pays,
  listePays
}) {
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState(pays ? pays : 'FR');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [pointRelaisCountries, setPointRelaisCountries] = useState((Array.isArray(listePays) && listePays.length > 0 ? listePays : COUNTRY_OPTIONS));

 

  const validatePostal = useCallback((pc, c) => {
    const clean = pc.trim();
    if (!/^\d{4,5}$/.test(clean)) return false;
    if ((c === 'FR' || c === 'DE') && clean.length !== 5) return false;
    if (c === 'BE' && clean.length !== 4) return false;
    return true;
  }, []);

  const normalize = (raw) => ({
    id: String(raw.id ?? ''),
    latitude: Number(raw.latitude ?? NaN),
    longitude: Number(raw.longitude ?? NaN),
    name: String(raw.name ?? 'Point relais'),
    countryCode: String(raw.countryCode ?? ''),
    zipCode: String(raw.zipCode ?? ''),
    city: String(raw.city ?? ''),
    address1: String(raw.address1 ?? ''),
    workingDays: Array.isArray(raw.workingDays) ? raw.workingDays : [],
    distanceMeters: Number(raw.distanceMeters ?? NaN),
  });

  const search = useCallback(async () => {
    if (!validatePostal(postalCode, country)) 
    {
      Alert.alert('Code postal invalide', `Format attendu pour ${country}.`);
      return;
    }

    try {
      setLoading(true);
      setResults([]);
      setSelectedId(null);


      const res = await axiosInstance.get(pointBaseUri + '/?country=' + country + '&postalCode=' + postalCode);

      const data = res.data;
      const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      const list = items.map(normalize).filter(ps => ps.id);

      setResults(list);

      if (!list.length) Alert.alert('Aucun point relais', 'Essaie un autre code postal.');
    } 
    catch (e) 
    {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Échec de la recherche GLS.';
      Alert.alert('Erreur', msg);
    } 
    finally 
    {
      setLoading(false);
    }
  }, [postalCode, country, validatePostal]);

  const openInMaps = (ps) => 
  {
    if (!ps.latitude || !ps.longitude) return;

    const label = encodeURIComponent(ps.name);

    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?ll=${ps.latitude},${ps.longitude}&q=${label}`
        : `geo:${ps.latitude},${ps.longitude}?q=${ps.latitude},${ps.longitude}(${label})`;
    Linking.openURL(url).catch(() => {});
  };

  const persistSelection = async (ps) => 
  {
    const toSave = {
      id: ps.id,
      name: ps.name,
      address1: ps.address1,
      zipCode: ps.zipCode,
      city: ps.city,
      countryCode: String(ps.countryCode),
      workingDays: ps.workingDays
    };
    await savePointRelaisChoice(toSave);
  };

  const handleSelect = async (ps) => 
  {
    try {
      setSelectedId(ps.id);
      await persistSelection(ps);
      onRequestClose(true);
    } catch {
      Alert.alert('Oups', 'Impossible d’enregistrer la sélection.');
    }
  };

  const renderItem = ({ item }) => {
    const addr = [item.address1, `${item.zipCode} ${item.city}`].filter(Boolean).join(' • ');
    return (
      <View style={[styles.card, selectedId === item.id && styles.cardSelected]}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.subtitle}>{addr}</Text>

        {Array.isArray(item.workingDays) && item.workingDays.length > 0 && (
          <View style={styles.hoursWrap}>
            {chunkBy(item.workingDays, 3).map((row, rIdx) => (
              <View key={rIdx} style={styles.hoursRow}>
                {row.map((d, cIdx) => (
                  <View key={cIdx} style={styles.hoursCol}>
                    <Text style={styles.hourDay}>
                      {language === 'fr' ? (d.dayFr || d.dayEn) : (d.dayEn || d.dayFr)}
                    </Text>
                    <Text style={styles.hourSlots}>
                      {Array.isArray(d.hours) && d.hours.length ? d.hours.join(' • ') : '—'}
                    </Text>
                  </View>
                ))}
                {/* si la dernière ligne a < 3 colonnes, on “remplit” pour garder l’espacement */}
                {row.length < 3 &&
                  Array.from({ length: 3 - row.length }).map((_, i) => (
                    <View key={`sp-${i}`} style={[styles.hoursCol, { opacity: 0 }]} />
                  ))
                }
              </View>
            ))}
          </View>
        )}


        <View style={styles.row}>
          {item.latitude && item.longitude ? (
            <TouchableOpacity style={styles.link} onPress={() => openInMaps(item)}>
              <Text style={styles.linkText}>Voir sur la carte</Text>
            </TouchableOpacity>
          ) : null}

          <View style={{ flex: 1 }} />

          <TouchableOpacity style={styles.selectBtn} onPress={() => handleSelect(item)}>
            <Text style={styles.selectBtnText}>
              {selectedId === item.id ? 'Sélectionné' : 'Je sélectionne ce point'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => onRequestClose(false)}
    >
      <View style={styles.modalRoot}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Points relais</Text>
          <TouchableOpacity onPress={() => onRequestClose(false)} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Fermer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formRow}>
          <View style={[styles.inputWrap, { flex: 1 }]}>
            <Text style={styles.label}>Code postal</Text>
            <TextInput
              value={postalCode}
              onChangeText={setPostalCode}
              placeholder={'Saisir votre code postal'}
              keyboardType="number-pad"
              maxLength={country === 'BE' ? 4 : 5}
              style={styles.input}
            />
          </View>

          
          <View style={[styles.inputWrap, { width: 180 }]}>
            <Text style={styles.label}>Pays</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={country}
                onValueChange={(val) => setCountry(val)}
                mode="dropdown"
                dropdownIconColor="#333"
              >
                {pointRelaisCountries.map((opt) => (
                  <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={search} disabled={loading} style={[styles.searchBtn, loading && { opacity: 0.6 }]}>
          {loading ? <ActivityIndicator /> : <Text style={styles.searchBtnText}>Afficher les points relais</Text>}
        </TouchableOpacity>

        <FlatList
          data={results}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 20 }}
          ListEmptyComponent={!loading ? <Text style={styles.empty}>Aucun résultat pour l’instant.</Text> : null}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, backgroundColor: '#fff', padding: 16, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  closeBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#eee' },
  closeBtnText: { fontWeight: '700' },

  formRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  inputWrap: {},
  label: { fontSize: 12, color: '#555', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 12, height: 44, fontSize: 16 },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: { borderWidth: 1, borderColor: '#ddd', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fff' },
  pillActive: { backgroundColor: '#222' },
  pillText: { fontSize: 12, color: '#333' },
  pillTextActive: { color: '#fff' },

  searchBtn: { marginTop: 14, backgroundColor: '#222', height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#888', marginTop: 18 },

  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, marginTop: 10, backgroundColor: '#fafafa' },
  cardSelected: { borderColor: '#222' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#555', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badge: { fontSize: 12, color: '#222', backgroundColor: '#eee', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  link: { paddingHorizontal: 8, paddingVertical: 4 },
  linkText: { color: '#0a84ff', fontSize: 12, fontWeight: '600' },
  selectBtn: { backgroundColor: '#0a84ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  selectBtnText: { color: '#fff', fontWeight: '700' },

    hoursWrap: { marginTop: 6, marginBottom: 8 },
  hoursRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  hoursCol: {
    flex: 1,                // 3 colonnes auto
    minWidth: 0,            // évite le débordement
  },
  hourDay: { fontSize: 12, fontWeight: '700', color: '#333', marginBottom: 2 },
  hourSlots: { fontSize: 12, color: '#444', lineHeight: 16 },

  pickerWrap: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
