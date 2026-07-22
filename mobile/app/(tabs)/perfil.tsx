import Layout from '@/components/ui/Layout';
import { api } from '@/services/api';
import { Text } from '@react-navigation/elements';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export default function Perfil() {

    const [name, setName] = useState('')

    const [email, setEmail] = useState('')

    const [studentId, setStudentId] = useState('')

    const [currentPassword, setCurrentPassword] = useState('')

    const [newPassword, setNewPassword] = useState('')

    const [confirmPassword, setConfirmPassword] = useState('')

    // TODO (fase de front-end): adicionar botão de "olho" para alternar a visibilidade
    // das senhas no modal de troca de senha, reaproveitando o padrão da tela de login.
    const [showPassword] = useState(false)

    const [modalVisible, setModalVisible] = useState(false)

    const [modalPasswordVisible, setModalPasswordVisible] = useState(false)

    const [modalMessage, setModalMessage] = useState('')

    const { logout, token, isAuthenticated, isLoading } = useAuth()

    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login')
        }
    }, [isAuthenticated, isLoading, router])

    useEffect(() => {

        const fetchProfile = async () => {

            if (!token) return

            try {
                const { ok, data } = await api<{ name: string; email: string; student_id: string }>('/profile')

                if (ok) {
                    setEmail(data.email)
                    setName(data.name)
                    setStudentId(data.student_id)
                }
            }
            catch (error) {
                console.error('Erro ao buscar perfil:', error)
            }
        }

        fetchProfile()
    }, [token])

    const handleSave = async () => {

        if (!name || !email) {
            setModalMessage('Por favor, preencha todos os campos.')

            setModalVisible(true)

            return
        }

        try {

            const { ok, data } = await api<{ success: string }>('/profile', {
                method: 'PATCH',
                body: { name, email }
            })

            if (ok) {
                setModalMessage(data.success)
                setModalVisible(true)
            }
            else {
                setModalMessage('Não foi possível atualizar os dados do usuário, tente novamente mais tarde.')
                setModalVisible(true)
            }
        }
        catch {
            setModalMessage('Erro ao conectar com o servidor.')
            setModalVisible(true)
        }
    }

    const handleLogout = async () => {

        try {
            await logout()
            router.replace('/login')
        }
        catch {
            setModalMessage('Erro ao conectar com o servidor.')
            setModalVisible(true)
        }

    }

    const handleChangePassword = async () => {

        if (!currentPassword || !newPassword || !confirmPassword) {
            setModalMessage('Preencha todos os campos.')

            setModalVisible(true)

            return
        }

        if (newPassword !== confirmPassword) {
            setModalMessage('A nova senha e a confirmação não coincidem.')

            setModalVisible(true)

            return
        }

        try {

            const { ok } = await api('/profile/change-password', {
                method: 'POST',
                body: {
                    old_password: currentPassword,
                    password: newPassword,
                    password_confirmation: confirmPassword
                }
            })

            if (ok) {
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')

                setModalPasswordVisible(false)

                setModalMessage('Senha atualizada com sucesso!')
                setModalVisible(true)
            }
            else {
                setModalMessage('Erro ao alterar a senha.')
                setModalVisible(true)
            }
        }
        catch {
            setModalMessage('Erro ao conectar com o servidor.')
            setModalVisible(true)
        }
    }
            
    return (
        <Layout>
            <ScrollView contentContainerStyle={style.perfil} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>               
                <View>
                    <Image source={require('../../assets/images/Perfil/perfil.jpg')} style={style.imagem}/>

                    <TextInput
                        value={name}
                        onChangeText={setName}
                        style={style.dadosPerfil}
                        placeholder="Nome Completo"
                        placeholderTextColor="#999"
                        keyboardType="default"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        style={style.dadosPerfil}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                
                    <TextInput
                        value={studentId}
                        onChangeText={setStudentId}
                        style={style.dadosPerfil}
                        placeholder="Prontuário"
                        placeholderTextColor="#999"
                        keyboardType="default"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={false}
                    />
               
                    <TouchableOpacity onPress={() => setModalPasswordVisible(true)} style={[ style.button, style.buttonPassword ]}>
                        <Text style={style.buttonText}>ATUALIZAR SENHA</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSave} style={[ style.button, style.buttonSave ]}>
                        <Text style={style.buttonText}>SALVAR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleLogout} style={[ style.button, style.buttonLogout ]}>
                        <Text style={style.buttonText}>SAIR</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {
                modalVisible && (
                    <View style={style.modal}>
                        <View style={style.modalContent}>
                            <Text style={style.modalText}>{ modalMessage }</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={style.modalButton}>
                                <Text style={style.modalButtonText}>FECHAR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            }

            {
                modalPasswordVisible && (
                    <View style={style.modal}>
                        <View style={style.modalContent}>
                            <TextInput
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry={!showPassword}
                                style={[style.dadosPerfil, style.password]}
                                placeholder="Senha atual"
                                placeholderTextColor="#999"
                                autoCapitalize="none"
                            />

                            <TextInput
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showPassword}
                                style={[style.dadosPerfil, style.password]}
                                placeholder="Nova senha"
                                placeholderTextColor="#999"
                                autoCapitalize="none"
                            />

                            <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                                style={[style.dadosPerfil, style.password]}
                                placeholder="Confirmar nova senha"
                                placeholderTextColor="#999"
                                autoCapitalize="none"
                            />

                            <TouchableOpacity onPress={handleChangePassword} style={[style.modalButton, style.modalButtonPassword]}>
                                <Text style={style.modalButtonText}>ATUALIZAR SENHA</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setModalPasswordVisible(false)} style={[style.modalButton, style.modalButtonPassword]}>
                                <Text style={style.modalButtonText}>FECHAR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            }
        </Layout>
    )
}

const style = StyleSheet.create({
    dadosPerfilArea: {
        width: 250,
        height: 60,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e1e5e9',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderRadius: 12,
        marginVertical: 10
    },
    password: {
        width: '100%'
    },
    areaTabela: {
        flexDirection: 'row',
        paddingLeft: 50
    },
    inicio: {
        flexDirection: 'row',
        paddingRight: 20,
    },
    dadosPerfil: {
        fontFamily: 'ElmsSans',
        fontSize: 14,
        lineHeight: 14,
        color: '#666',
        height: 60,
        width: 250,
        // flex: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e1e5e9',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginVertical: 10,
    },
    buttonEdit: {
        paddingLeft: 20,
        paddingTop: 24
    },
    buttonEdit_1: {
        paddingLeft: 5,
    },
    perfil: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    imagem:{
        width: 180,
        height: 180,
        marginHorizontal: 'auto',
        marginBottom: 10
    },
    pedidosList: {
        backgroundColor: '#32984D',
        justifyContent: 'center',
        alignItems: 'center',
        width: 200,
        height: 200,
        borderRadius: 12,
    },
    button: {
        width: 250, 
        height: 60, 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: 12, 
        marginTop: 10,
    },
    buttonText: {
        fontFamily: 'ElmsSans-SemiBold',
        fontSize: 14,
        lineHeight: 14,
        color: 'white', 
    },
    buttonSave: {
        backgroundColor: '#32984D', 
    },
    buttonLogout: {
        backgroundColor: '#D54A4A', 
    },
    buttonPassword: {
        backgroundColor: '#1434A4'
    },
    modal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, .5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        backgroundColor: '#FFF',
    },
    modalText: {
        fontFamily: 'ElmsSans',
        fontSize: 16,
        marginBottom: 15,
        textAlign: 'center',
        color: '#333',
    },
    modalButton: {
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#32984D',
    },
    modalButtonPassword: {
        marginTop: 10,
    },
    modalButtonText: {
        fontFamily: 'ElmsSans-SemiBold',
        fontSize: 14,
        color: '#FFF',
    }
})