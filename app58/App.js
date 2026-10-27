import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, Alert, StatusBar, StyleSheet, Switch, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Android emulator: 10.0.2.2 | Real phone: your PC's Wi-Fi IP, e.g. http://192.168.1.5:5000
const API = 'http://192.168.29.94:5000';

const api = async (p, m = 'GET', b) => {
  const r = await fetch(API + p, { method: m, headers: { 'Content-Type': 'application/json' }, body: b ? JSON.stringify(b) : undefined });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'Something went wrong');
  return j;
};

const C = { bg: '#0F0B1E', card: '#1C1633', pri: '#8B5CF6', acc: '#F472B6', txt: '#fff', mut: '#A8A3C0' };

const Btn = ({ t, onPress, alt }) => (
  <TouchableOpacity style={[s.btn, alt && { backgroundColor: C.acc }]} onPress={onPress}><Text style={s.btnT}>{t}</Text></TouchableOpacity>
);
const In = (p) => <TextInput placeholderTextColor={C.mut} style={s.in} {...p} />;

function Auth({ onLogin }) {
  const [reg, setReg] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const go = async () => {
    try {
      if (reg) await api('/register', 'POST', f);
      onLogin(await api('/login', 'POST', f));
    } catch (e) { Alert.alert('Oops', e.message); }
  };
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={s.logo}>ReSet ✈️</Text>
      <Text style={[s.mut, { marginBottom: 24 }]}>Find your travel tribe. Reset your vibe.</Text>
      {reg && <In placeholder="Name" onChangeText={v => setF({ ...f, name: v })} />}
      <In placeholder="Email" autoCapitalize="none" onChangeText={v => setF({ ...f, email: v })} />
      <In placeholder="Password" secureTextEntry onChangeText={v => setF({ ...f, password: v })} />
      <Btn t={reg ? 'Sign up' : 'Log in'} onPress={go} />
      <Text style={[s.mut, { textAlign: 'center', marginTop: 16 }]} onPress={() => setReg(!reg)}>
        {reg ? 'Have an account? Log in' : 'New here? Sign up'}
      </Text>
    </View>
  );
}

function TripCard({ t, onJoin }) {
  return (
    <View style={s.card}>
      <Text style={s.h}>{t.title}</Text>
      <Text style={s.mut}>📍 {t.destination}   📅 {t.date}</Text>
      <Text style={{ color: C.txt, marginVertical: 6 }}>{t.description}</Text>
      <Text style={{ color: C.acc }}>₹{t.price}  •  {t.seats_left ?? ''} seats left {t.women_only ? ' • 👩 Women only' : ''}</Text>
      {onJoin && <Btn t={`Join & pay 20% (₹${Math.round(t.price * 0.2)})`} onPress={() => onJoin(t)} />}
      {t.advance_paid > 0 && <Text style={{ color: '#34D399', marginTop: 6 }}>✅ Advance paid: ₹{t.advance_paid}</Text>}
    </View>
  );
}

function Explore({ user }) {
  const [trips, setTrips] = useState([]);
  const [q, setQ] = useState('');
  const load = useCallback(() => api('/trips').then(setTrips).catch(e => Alert.alert('Server error', e.message)), []);
  useEffect(() => { load(); }, [load]);

  const join = t => Alert.alert('Pay advance', `Pay ₹${Math.round(t.price * 0.2)} via UPI (demo) to confirm your seat?`, [
    { text: 'Cancel' },
    { text: 'Pay', onPress: async () => {
        try { await api(`/trips/${t.id}/join`, 'POST', { userId: user.id }); Alert.alert("You're in! 🎉"); load(); }
        catch (e) { Alert.alert('Oops', e.message); }
    } },
  ]);

  const list = trips.filter(t => (t.title + t.destination).toLowerCase().includes(q.toLowerCase()));
  return (
    <View style={{ flex: 1 }}>
      <In placeholder="🔍 Search destination..." onChangeText={setQ} />
      <FlatList data={list} keyExtractor={t => String(t.id)} renderItem={({ item }) => <TripCard t={item} onJoin={join} />} onRefresh={load} refreshing={false} />
    </View>
  );
}

function Create({ user, done }) {
  const [f, setF] = useState({ title: '', destination: '', date: '', price: '', seats: '', description: '', women_only: false });
  const set = k => v => setF({ ...f, [k]: v });
  const save = async () => {
    try { await api('/trips', 'POST', { ...f, creator: user.id }); Alert.alert('Trip created! 🚀'); done(); }
    catch (e) { Alert.alert('Oops', e.message); }
  };
  return (
    <ScrollView>
      <Text style={s.h}>Plan a new trip</Text>
      <In placeholder="Title" onChangeText={set('title')} />
      <In placeholder="Destination" onChangeText={set('destination')} />
      <In placeholder="Date (YYYY-MM-DD)" onChangeText={set('date')} />
      <In placeholder="Price per person (₹)" keyboardType="numeric" onChangeText={set('price')} />
      <In placeholder="Total seats" keyboardType="numeric" onChangeText={set('seats')} />
      <In placeholder="Description" multiline onChangeText={set('description')} />
      <View style={s.row}>
        <Text style={{ color: C.txt }}>👩 Women-only trip</Text>
        <Switch value={f.women_only} onValueChange={set('women_only')} />
      </View>
      <Btn t="Create trip" onPress={save} />
    </ScrollView>
  );
}

function MyTrips({ user }) {
  const [t, setT] = useState([]);
  useEffect(() => { api('/mytrips/' + user.id).then(setT).catch(() => {}); }, []);
  return (
    <FlatList data={t} keyExtractor={x => String(x.id)}
      ListEmptyComponent={<Text style={s.mut}>No trips yet. Go explore!</Text>}
      renderItem={({ item }) => <TripCard t={item} />} />
  );
}

const Safety = () => (
  <ScrollView>
    <Text style={s.h}>🛡️ Safety for Women</Text>
    {[
      'Look for "Women only" trips and verified hosts.',
      'Share live location & trip details with a trusted contact.',
      'Meet your group in a public place before the trip.',
      'Keep emergency numbers saved: 112 (all), 1091 (women helpline).',
      'Trust your gut. Leave any situation that feels off.',
    ].map((x, i) => <Text key={i} style={s.card2}>✔ {x}</Text>)}
    <Btn alt t="🚨 SOS – Call 112" onPress={() => Linking.openURL('tel:112')} />
    <Btn t="Women Helpline 1091" onPress={() => Linking.openURL('tel:1091')} />
  </ScrollView>
);

const About = () => (
  <ScrollView>
    <Text style={s.h}>About ReSet</Text>
    <Text style={s.card2}>ReSet connects students, employees and solo travellers so nobody has to skip a trip for lack of company. Create trips, join squads, pay a small advance to lock your seat, and travel safe.</Text>
    <Text style={s.card2}>Built by Sakshi Mahale 241071905 • CPAD Final Year Project</Text>
  </ScrollView>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('Explore');
  const tabs = { Explore: '🧭', Create: '➕', 'My Trips': '🎒', Safety: '🛡️', About: 'ℹ️' };

  if (!user) return <SafeAreaView style={s.root}><StatusBar barStyle="light-content" /><Auth onLogin={setUser} /></SafeAreaView>;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" />
      <Text style={s.top}>Hey {user.name || 'traveller'} 👋</Text>
      <View style={{ flex: 1, padding: 12 }}>
        {tab === 'Explore' && <Explore user={user} />}
        {tab === 'Create' && <Create user={user} done={() => setTab('Explore')} />}
        {tab === 'My Trips' && <MyTrips user={user} />}
        {tab === 'Safety' && <Safety />}
        {tab === 'About' && <About />}
      </View>
      <View style={s.bar}>
        {Object.keys(tabs).map(k => (
          <TouchableOpacity key={k} onPress={() => setTab(k)} style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 22 }}>{tabs[k]}</Text>
            <Text style={{ color: tab === k ? C.acc : C.mut, fontSize: 11 }}>{k}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  top: { color: C.txt, fontSize: 18, padding: 14, fontWeight: '700' },
  logo: { color: C.txt, fontSize: 40, fontWeight: '800' },
  mut: { color: C.mut },
  h: { color: C.txt, fontSize: 20, fontWeight: '700', marginBottom: 6 },
  in: { backgroundColor: C.card, color: C.txt, borderRadius: 12, padding: 12, marginVertical: 6 },
  btn: { backgroundColor: C.pri, borderRadius: 12, padding: 14, alignItems: 'center', marginVertical: 8 },
  btnT: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 14, marginVertical: 6 },
  card2: { backgroundColor: C.card, color: C.txt, borderRadius: 12, padding: 12, marginVertical: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8 },
  bar: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: C.card, paddingVertical: 8 },
});
