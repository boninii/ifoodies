import Layout from '@/components/ui/Layout';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '@react-navigation/elements';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

// Chave única do carrinho no AsyncStorage. Produtos, carrinho e finalização
// usam a MESMA chave para que edições e remoções persistam.
const STORAGE_KEY = '@pedido'

type CartProduct = {
    id: number
    name: string
    description?: string
    quantity: number
    price: number
    stock: number
}

type ItemProps = {
    item: CartProduct
    isEven: boolean
    onEdit: (item: CartProduct) => void
    onDelete: (id: number) => void
}

function Item({ item, isEven, onEdit, onDelete }: ItemProps) {
    return (
        <View style={[style.item, isEven ? style.itemEven : style.itemOdd]}>
            <View style={style.itemHeader}>
                <Text style={style.itemName}>{item.name}</Text>

                <Text style={style.itemQuantity}>{item.quantity}x</Text>

                <Text style={style.itemPrice}>R${Number(item.price).toFixed(2)}</Text>
            </View>

            <View style={style.itemBottom}>
                <TouchableOpacity
                    style={style.itemBottomButton}
                    onPress={() => onEdit(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Editar ${item.name}`}
                >
                    <Ionicons name="pencil" size={20} color="#000" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={style.itemBottomButton}
                    onPress={() => onDelete(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Remover ${item.name}`}
                >
                    <Ionicons name="trash" size={20} color="#D54A4A" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default function Carrinho(){

    const [selectedProduct, setSelectedProduct] = useState<CartProduct | null>(null)

    const [products, setProducts] = useState<CartProduct[]>([])

    const [modalVisible, setModalVisible] = useState(false)

    const { isAuthenticated, isLoading } = useAuth()

    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
          router.replace('/login')
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {

        const fetchOrder = async () => {

            try {

                const stored = await AsyncStorage.getItem(STORAGE_KEY)

                if (stored) {
                    setProducts(JSON.parse(stored))
                }
            }
            catch (error) {
                console.error('Erro ao buscar pedido local', error)
            }
        }

        fetchOrder()
    }, [])

    // Atualiza estado e storage de uma vez só, mantendo a fonte da verdade única.
    const persist = async (updated: CartProduct[]) => {
        setProducts(updated)

        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        }
        catch (error) {
            console.error('Erro ao salvar carrinho', error)
        }
    }

    const handleCreateOrder = async () => {

        try {

            const body = {
                products: products.map(product => ({
                    id: product.id,
                    quantity: product.quantity
                }))
            }

            const { ok } = await api('/orders', { method: 'POST', body })

            if (ok) {
                await AsyncStorage.removeItem(STORAGE_KEY)
                setProducts([])

                Alert.alert('Sucesso', 'Pedido criado com sucesso!', [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/pedidos')
                    }
                ])
            }
            else {
                Alert.alert('Erro ao criar pedido.')
            }
        }
        catch {
            Alert.alert('Erro', 'Erro ao conectar com o servidor.')
        }
    }

    const updateQuantity = (delta: number) => {
        setSelectedProduct(prev => {
            if (!prev) return prev

            const newQuantity = prev.quantity + delta

            if (newQuantity < 1) return { ...prev, quantity: 1 }

            if (newQuantity > prev.stock) {
                Alert.alert('Estoque insuficiente', 'Você já selecionou a quantidade máxima disponível em estoque.')
                return prev
            }

            return { ...prev, quantity: newQuantity }
        })
    }

    const handleEdit = (item: CartProduct) => {
        setSelectedProduct(item)
        setModalVisible(true)
    }

    const confirmUpdate = async () => {
        if (!selectedProduct) return

        const updated = products.map(prod =>
            prod.id === selectedProduct.id ? selectedProduct : prod
        )

        await persist(updated)

        setModalVisible(false)
    }

    const handleDelete = async (id: number) => {
        await persist(products.filter(item => item.id !== id))
    }

    const quantityItems = products.reduce((sum, p) => sum + p.quantity, 0)

    const total = products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)

    return(
        <Layout>
            {
                products.length ? (
                    <ScrollView contentContainerStyle={style.main}>
                        <Text style={style.nPedido}>Carrinho</Text>

                        <View style={style.productsList}>
                            {
                                products.map((item, index) => (
                                    <Item
                                        key={item.id}
                                        item={item}
                                        isEven={index % 2 === 0}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))
                            }
                        </View>
                        
                         <LinearGradient
                            colors={['#F2F2F2', '#32984D', '#F2F2F2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={style.linha}
                        />

                        <View style={style.resultado}>
                            <Text style={style.resultadoText}>Total:</Text>
                            
                            <Text style={style.resultadoText}>{`${quantityItems} ${quantityItems > 1 ? 'Itens' : 'Item'}`}</Text>
                            
                            <Text style={style.resultadoText}>R${total}</Text>
                        </View>
                        
                        <LinearGradient
                            colors={['#F2F2F2', '#32984D', '#F2F2F2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={style.linha}
                        />
                        
                        <Text style={style.bottomTitle}>Formas de Pagamento</Text>
                        
                        <View style={style.bottomWaysToPay}>
                            <TouchableOpacity>
                                <AntDesign name="credit-card" size={30} color="#32984D" />
                            </TouchableOpacity>
                            
                            <TouchableOpacity>
                                <FontAwesome6 name="pix" size={30} color="#32984D" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={style.buttonConfirm} onPress={handleCreateOrder}>
                            <Text style={style.buttonConfirmText}>REALIZAR PEDIDO</Text>
                        </TouchableOpacity>
                    </ScrollView>
                    
                ) : (
                    <View style={style.emptyCart}>
                        <Text style={style.emptyCartText}>Seu carrinho está vazio!</Text>
                        <Link href="/produtos" style={style.emptyCartButton}>COMPRAR AGORA</Link>
                    </View>
                )
            }

            {
                modalVisible && selectedProduct && (
                    <View style={style.modalBackground}>
                        <View style={style.modal}>
                        
                            <Text style={style.modalTitle}>{selectedProduct.name}</Text>
                            
                            <Text style={style.modalDescription}>{selectedProduct.description}</Text>

                            <View style={style.modalQuantity}>
                                <TouchableOpacity onPress={() => updateQuantity(-1)}>
                                    <Text style={style.modalQuantityButton}>-</Text>
                                </TouchableOpacity>

                                <Text style={style.modalQuantityButtonText}>{selectedProduct.quantity}</Text>

                                <TouchableOpacity onPress={() => updateQuantity(1)}>
                                    <Text style={style.modalQuantityButton}>+</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity onPress={confirmUpdate} style={style.modalButtonConfirm}>
                                <Text style={style.modalButtonText}>ATUALIZAR</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setModalVisible(false)} style={style.modalButtonClose}>
                                <Text style={style.modalButtonText}>FECHAR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            }
        </Layout>
    )
}

const screenHeight = Dimensions.get('window').height

const style = StyleSheet.create({
    main: {
        fontFamily: 'ElmsSans',
        flexGrow: 1,
        paddingVertical: 20,
        alignItems: 'center',
        paddingBottom: 40
    },
    item: {
        width: '100%',
        flex: 1,
        height: 110,
        paddingTop: 15,
        paddingBottom: 10,
        paddingHorizontal: 15
    },
    itemEven: {
        backgroundColor: 'rgba(50, 152, 77, .1)'
    },
    itemOdd: {
        backgroundColor: 'rgba(50, 152, 77, .22)'
    },
    productsList: {
        width: '100%',
        marginBottom: 20
    },
    itemName: {
        width: '60%',
        fontFamily: 'Fraunces',
        fontSize: 16,
        lineHeight: 20
    },
    itemQuantity: {
        width: '10%',
        fontFamily: 'ElmsSans',
        fontSize: 16,
        lineHeight: 18,
        textAlign: 'center'
    },
    itemPrice: {
        width: '30%',
        fontFamily: 'ElmsSans',
        fontSize: 16,
        lineHeight: 18,
        textAlign: 'right'
    },
    itemHeader: {
        width: '100%',
        height: 18,
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemBottom: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 15,
        marginTop: 'auto',
    },
    itemBottomButton: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultado: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: 70,
        paddingHorizontal: 40
    },
    resultadoText: {
        fontFamily: 'ElmsSans-SemiBold',
        fontSize: 14,
        lineHeight: 16,
        color: '#666'
    },
    linha: {
        width: '100%',
        height: 1,
        marginVertical: 20,
    },
    nPedido: {
        fontFamily: 'Fraunces',
        fontSize: 24,
        textAlign: 'center',
        paddingVertical: 40
    },
    bottomTitle: {
        fontFamily: 'ElmsSans',
        fontSize: 20,
        lineHeight: 24,
        paddingVertical: 20,
        color: '#666'
    },
    bottomWaysToPay: {
        flexDirection: 'row', 
        gap: 25
    },
    emptyCart: {
        height: screenHeight - 128,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyCartText: {
        fontFamily: 'Fraunces',
        fontSize: 24,
        lineHeight: 30,
        paddingBottom: 20,
        color: '#666'
    },
    emptyCartButton: {
        width: 250,
        fontFamily: 'ElmsSans-SemiBold',
        fontSize: 14,
        lineHeight: 16,
        paddingVertical: 15,
        alignItems: 'center',
        textAlign: 'center',
        elevation: 5,
        borderRadius: 8,
        shadowRadius: 8,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowColor: '#000',
        color: '#FFF',
        backgroundColor: '#32984D',
    },
    modalBackground: {
        position: 'absolute',
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modal: {
        width: '80%',
        alignItems: 'center',
        borderRadius: 12,
        paddingVertical: 40,
        paddingHorizontal: 40,
        backgroundColor: '#FFF',
    },
    modalTitle: {
        fontFamily: 'Fraunces',
        fontSize: 20,
        lineHeight: 24,
        paddingBottom: 8
    },
    modalDescription: {
        fontFamily: 'ElmsSans',
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 16,
    },
    modalQuantity: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20
    },
    modalQuantityButton: {
        fontSize: 24,
        paddingHorizontal: 12,
        color: '#32984D'
    },
    modalQuantityButtonText: {
        fontFamily: 'ElmsSans',
        fontSize: 18,
        lineHeight: 18,
        marginHorizontal: 10
    },
    modalButtonConfirm: {
        width: 180,
        borderRadius: 8,
        alignItems: 'center',
        paddingVertical: 15,
        backgroundColor: '#32984D',
    },
    modalButtonText: {
        fontFamily: 'ElmsSans-SemiBold',
        fontSize: 14,
        lineHeight: 14,
        color: '#fff',
    },
    modalButtonClose: {
        width: 180,
        marginTop: 10,
        borderRadius: 8,
        alignItems: 'center',
        paddingVertical: 15,
        backgroundColor: '#D54A4A', 
    },
     buttonConfirm: {
        width: 180,
        borderRadius: 8,
        alignItems: 'center',
        paddingVertical: 15,
        marginTop: 40,
        backgroundColor: '#32984D',
    },
    buttonConfirmText: {
        fontFamily: 'ElmsSans-SemiBold',
        fontSize: 14,
        lineHeight: 14,
        color: '#fff',
    },
})