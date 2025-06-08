import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    flex: {
        flex: 1
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        backgroundColor: Colors.pink,
        paddingHorizontal: 15
    },
    headerTitle: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 10
    },
    scroll: {
        padding: 15,
        paddingTop: 10,
        paddingBottom: 30
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        marginVertical: 8
    },
    requiredAsterisk: {
        color: Colors.pink,
        fontWeight: 'bold',
        fontSize: 16
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFF5F5'
    },
    inputSelected: {
        borderColor: Colors.green,
        borderWidth: 2
    },
    addressInputContainer: {
        position: 'relative'
    },
    addressInput: {
        paddingRight: 70,
        minHeight: 50
    },
    addressIconsContainer: {
        position: 'absolute',
        right: 10,
        top: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center'
    },
    addressIcon: {
        padding: 5
    },
    descriptionContainer: {
        position: 'relative'
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
        paddingRight: 40
    },
    descriptionClearButton: {
        position: 'absolute',
        right: 10,
        top: 12
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.pink,
        borderRadius: 10,
        padding: 15,
        justifyContent: 'center'
    },
    compactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.pink,
        borderRadius: 10,
        padding: 12,
        justifyContent: 'center',
        alignSelf: 'flex-start',
        minWidth: 120
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 6
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10
    },
    halfButton: {
        flex: 0.48,
        padding: 12
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10
    },
    imagePreviewContainer: {
        position: 'relative',
        marginRight: 10,
        marginBottom: 10
    },
    imagePreview: {
        width: 80,
        height: 60,
        borderRadius: 8
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10
    },
    services: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 15
    },
    serviceItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    serviceItemSelected: {
        backgroundColor: '#FFE4E1',
        borderColor: Colors.pink
    },
    serviceText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 8
    },
    serviceTextSelected: {
        color: Colors.pink,
        fontWeight: '600'
    },
    checkbox: {
        width: 18,
        height: 18
    },
    deleteServiceButton: {
        marginLeft: 5
    },
    addServiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5F5',
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.pink,
        borderStyle: 'dashed',
        marginBottom: 15
    },
    addServiceButtonText: {
        color: Colors.pink,
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '600'
    },
    addServiceContainer: {
        marginBottom: 15
    },
    addServiceButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 10,
        gap: 10
    },
    compactActionButton: {
        backgroundColor: Colors.pink,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancelActionButton: {
        backgroundColor: '#555'
    },
    compactButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600'
    },
    saveButton: {
        marginTop: 20,
        justifyContent: 'center'
    },
    disabledButtonText: {
        backgroundColor: '#FCA5A5'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modal: {
        backgroundColor: '#FFF5F5',
        borderWidth: 2,
        borderColor: Colors.pink,
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 10
    },
    modalIcon: {
        marginBottom: 10
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.pink,
        marginBottom: 10
    },
    modalText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        width: '100%'
    },
    modalButton: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    cancelButton: {
        backgroundColor: '#666'
    },
    confirmButton: {
        backgroundColor: Colors.pink
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontSize: 16,
        color: '#333'
    },
    mapButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#fff'
    },
    mapButton: {
        backgroundColor: Colors.pink,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    mapButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    numberInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        overflow: 'hidden',
        width: 140
    },
    numberInput: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        padding: 12,
        backgroundColor: 'transparent',
        borderWidth: 0
    },
    numberButtonsColumn: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 2
    },
    numberButton: {
        paddingVertical: 4,
        paddingHorizontal: 8
    }
});