import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface RequestsViewProps {
  events: string[];
}

const RequestsView: React.FC<RequestsViewProps> = ({ events }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebView Events:</Text>
      <ScrollView style={styles.scrollView}>
        {events.map((event, index) => (
          <Text key={index} style={styles.eventText}>
            {event}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 5,
    maxHeight: 150,
  },
  title: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  scrollView: {
    maxHeight: 130,
  },
  eventText: {
    color: 'white',
    fontSize: 10,
    marginBottom: 2,
  },
});

export default RequestsView;