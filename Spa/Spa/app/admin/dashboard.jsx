import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

const AdminStatisticsScreen = () => {
    const [selectedFilter, setSelectedFilter] = useState('thisMonth');
    const [loading, setLoading] = useState(false);
    
    // Mock data - thay thế bằng dữ liệu thực từ API
    const [statistics, setStatistics] = useState({
        currentMonth: {
            bookings: 245,
            newSpas: 12,
            reviews: 189,
        },
        bookingGrowth: 15.8,
        spaGrowth: 23.1,
        reviewGrowth: 8.4,
    });

    // Dữ liệu biểu đồ số lượng đặt lịch theo spa
    const [bookingChartData, setBookingChartData] = useState({
        labels: ['Spa Hồng Phúc', 'Beauty Spa', 'Relax Spa', 'VIP Spa', 'Golden Spa'],
        datasets: [{
            data: [85, 72, 58, 45, 38],
            color: (opacity = 1) => `rgba(255, 105, 180, ${opacity})`,
            strokeWidth: 2
        }]
    });

    // Dữ liệu biểu đồ lượt đánh giá theo spa
    const [reviewChartData, setReviewChartData] = useState({
        labels: ['Spa Hồng Phúc', 'Beauty Spa', 'Relax Spa', 'VIP Spa', 'Golden Spa'],
        datasets: [{
            data: [42, 35, 28, 22, 18]
        }]
    });

    const filterOptions = [
        { key: 'thisMonth', label: 'Tháng trước', icon: 'calendar-outline' },
        { key: 'lastMonth', label: 'Tháng này', icon: 'calendar' },
        { key: 'last3Months', label: '3 tháng', icon: 'calendar-sharp' },
        { key: 'last6Months', label: '6 tháng', icon: 'calendar-clear-outline' },
    ];

    const handleFilterChange = (filterKey) => {
        setSelectedFilter(filterKey);
        // Thực hiện gọi API để lấy dữ liệu theo filter
        loadStatistics(filterKey);
    };

    const loadStatistics = async (filter) => {
        setLoading(true);
        try {
            // Mock API call - thay thế bằng API thực tế
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Cập nhật dữ liệu dựa trên filter
            // setStatistics(newData);
            // setBookingChartData(newBookingData);
            // setReviewChartData(newReviewData);
            
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, growth, icon, color }) => (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <View style={styles.statHeader}>
                <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={18} color={color} />
                </View>
                <View style={styles.statGrowth}>
                    <Text style={[styles.growthText, { color: growth >= 0 ? '#4CAF50' : '#F44336' }]}>
                        {growth >= 0 ? '+' : ''}{growth}%
                    </Text>
                    <Ionicons 
                        name={growth >= 0 ? 'trending-up' : 'trending-down'} 
                        size={12} 
                        color={growth >= 0 ? '#4CAF50' : '#F44336'} 
                    />
                </View>
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </View>
    );

    const FilterButton = ({ option, isSelected, onPress }) => (
        <TouchableOpacity
            style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
            onPress={onPress}
        >
            <Ionicons 
                name={option.icon} 
                size={18} 
                color={isSelected ? '#fff' : '#666'} 
            />
            <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextSelected]}>
                {option.label}
            </Text>
        </TouchableOpacity>
    );

    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 105, 180, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#FF69B4'
        }
    };

    const barChartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Thống kê hệ thống</Text>
                    <TouchableOpacity style={styles.refreshButton}>
                        <Ionicons name="refresh" size={24} color="#FF69B4" />
                    </TouchableOpacity>
                </View>

                {/* Statistics Cards */}
                <View style={styles.statsContainer}>
                    <StatCard
                        title="Đặt lịch tháng này"
                        value={statistics.currentMonth.bookings}
                        growth={statistics.bookingGrowth}
                        icon="calendar"
                        color="#FF69B4"
                    />
                    <StatCard
                        title="Spa mới đăng ký"
                        value={statistics.currentMonth.newSpas}
                        growth={statistics.spaGrowth}
                        icon="business"
                        color="#4CAF50"
                    />
                    <StatCard
                        title="Lượt đánh giá"
                        value={statistics.currentMonth.reviews}
                        growth={statistics.reviewGrowth}
                        icon="star"
                        color="#FF9800"
                    />
                </View>

                {/* Time Filter */}
                <View style={styles.filterContainer}>
                    <Text style={styles.sectionTitle}>Bộ lọc thời gian</Text>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterScrollView}
                    >
                        {filterOptions.map((option) => (
                            <FilterButton
                                key={option.key}
                                option={option}
                                isSelected={selectedFilter === option.key}
                                onPress={() => handleFilterChange(option.key)}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Booking Chart */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Số lượng đặt lịch theo Spa</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <LineChart
                            data={bookingChartData}
                            width={screenWidth + 50}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                            fromZero
                        />
                    </ScrollView>
                </View>

                {/* Review Chart */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Lượt đánh giá theo từng spa</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <BarChart
                            data={reviewChartData}
                            width={screenWidth + 50}
                            height={220}
                            chartConfig={barChartConfig}
                            style={styles.chart}
                            fromZero
                            showValuesOnTopOfBars
                        />
                    </ScrollView>
                </View>

                {/* Summary */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.sectionTitle}>Tóm tắt</Text>
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tổng số spa hoạt động:</Text>
                            <Text style={styles.summaryValue}>47</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tổng số đặt lịch:</Text>
                            <Text style={styles.summaryValue}>1,234</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Đánh giá trung bình:</Text>
                            <View style={styles.ratingContainer}>
                                <Text style={styles.summaryValue}>4.7</Text>
                                <Ionicons name="star" size={16} color="#FFD700" />
                            </View>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Doanh thu ước tính:</Text>
                            <Text style={[styles.summaryValue, styles.revenue]}>2.5M VNĐ</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    refreshButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginRight: 8,
        borderLeftWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        width: (screenWidth - 56) / 3, // Adjusted for padding and margin
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statGrowth: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    growthText: {
        fontSize: 10,
        fontWeight: '600',
        marginRight: 3,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        flexWrap: 'wrap',
    },
    filterContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    filterScrollView: {
        marginBottom: 10,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    filterButtonSelected: {
        backgroundColor: '#FF69B4',
        borderColor: '#FF69B4',
    },
    filterButtonText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    filterButtonTextSelected: {
        color: '#fff',
    },
    chartContainer: {
        paddingHorizontal: 20,
        marginTop: 25,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    summaryContainer: {
        paddingHorizontal: 20,
        marginTop: 25,
        marginBottom: 30,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    summaryLabel: {
        fontSize: 16,
        color: '#666',
        flex: 1,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    revenue: {
        color: '#4CAF50',
        fontSize: 18,
    },
});

export default AdminStatisticsScreen;