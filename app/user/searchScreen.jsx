import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';

// Giả định một API service
const searchService = async (query) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = [
        `Kết quả cho "${query}" 1`,
        `Kết quả cho "${query}" 2`,
        `Kết quả cho "${query}" 3`,
      ];
      resolve(results);
    }, 500);
  });
};

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([
    'Spa thư giãn',
    'Nail nghệ thuật',
    'Tóc thời thượng',
  ]);
  const [suggestions] = useState([
    'Spa gần tôi',
    'Nail giá rẻ',
    'Thẩm mỹ viện uy tín',
    'Tóc đẹp Hà Nội',
  ]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef(null);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSearch = useCallback(async () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      setIsLoading(true);
      setSearchResults([]);

      setSearchHistory((prevHistory) => {
        if (!prevHistory.includes(trimmedQuery)) {
          return [trimmedQuery, ...prevHistory].slice(0, 5);
        }
        return prevHistory;
      });

      try {
        const results = await searchService(trimmedQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Lỗi tìm kiếm:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleClearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  const handleSuggestionPress = useCallback((suggestion) => {
    setSearchQuery(suggestion);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const renderHistoryItem = useCallback(({ item }) => (
    <TouchableOpacity style={styles.historyItem} onPress={() => setSearchQuery(item)}>
      <Icon name="time-outline" size={20} color="#888" />
      <Text style={styles.historyText}>{item}</Text>
    </TouchableOpacity>
  ), []);

  const renderSuggestionItem = useCallback(({ item }) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSuggestionPress(item)}>
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  ), [handleSuggestionPress]);

  const renderSearchResultItem = useCallback(({ item }) => (
    <View style={styles.searchResultItem}>
      <Text style={styles.searchResultText}>{item}</Text>
    </View>
  ), []);

  const HEADER_HEIGHT = 50; 

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={Colors.pink}
        barStyle="light-content"
        translucent={false}
      />
      <View style={styles.headerContainer}>
        <View
          style={[styles.header, { height: HEADER_HEIGHT, backgroundColor: Colors.pink }]}
        >
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Tìm kiếm spa, nail..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoFocus
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Icon name="close-circle-outline" size={20} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? HEADER_HEIGHT : 0}
      >
        <View style={[styles.contentContainer, { paddingTop: HEADER_HEIGHT }]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.pink} />
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResultItem}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={<Text style={styles.searchResultsTitle}>Kết quả tìm kiếm</Text>}
              contentContainerStyle={styles.flatListContent}
            />
          ) : (
            <FlatList
              data={[{ key: 'content' }]}
              renderItem={() => (
                <View style={styles.innerContent}>
                  {searchHistory.length > 0 && (
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Lịch sử tìm kiếm</Text>
                        <TouchableOpacity onPress={handleClearHistory}>
                          <Text style={styles.clearText}>Xóa</Text>
                        </TouchableOpacity>
                      </View>
                      <FlatList
                        data={searchHistory}
                        renderItem={renderHistoryItem}
                        keyExtractor={(item, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                      />
                    </View>
                  )}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Gợi ý tìm kiếm</Text>
                    <FlatList
                      data={suggestions}
                      renderItem={renderSuggestionItem}
                      keyExtractor={(item, index) => index.toString()}
                      showsVerticalScrollIndicator={false}
                    />
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.key}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pink, // Đồng bộ với StatusBar và header
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backButton: {
    marginRight: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45, // Đồng bộ với Home
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  clearButton: {
    marginLeft: 8,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#fff', // Nội dung chính màu trắng
  },
  contentContainer: {
    flex: 1,
  },
  innerContent: {
    paddingHorizontal: 15,
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearText: {
    fontSize: 14,
    color: Colors.pink,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  historyText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  suggestionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  suggestionText: {
    fontSize: 16,
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  searchResultItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  searchResultText: {
    fontSize: 16,
    color: '#333',
  },
});