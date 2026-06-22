import React, { Component } from "react"
import { View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import todayImage from '../../assets/imgs/today.jpg'
import moment from 'moment'
import 'moment/locale/pt-br'
import commonStyles from '../commonStyles'
import Task from '../components/Task'
import Icon from 'react-native-vector-icons/FontAwesome'
import AddTask from './AddTask'
import AsyncStorage from '@react-native-async-storage/async-storage'

const initialState = {
    showDoneTasks: true,
    showAddTask:false,
    visibleTasks: [],
    tasks: []
 }

interface Task {
    id: number
    desc: string
    estimateAt: Date | null
    doneAt: Date | null
}

interface TaskListState {
    tasks: Task[]
    visibleTasks: Task[]
    showDoneTasks: boolean
    showAddTask: boolean
}

export default class TaskList extends Component {
    state: TaskListState = {
        ...initialState,
    }

    componentDidMount = async () => {
        const stateString = await AsyncStorage.getItem('tasksState')
        const state = stateString ? JSON.parse(stateString) : initialState
        this.setState(state, this.filterTasks)
    }

    toggleFilter = () => {
        this.setState({ showDoneTasks: !this.state.showDoneTasks }, this.filterTasks)
    }

    filterTasks = () => {
        let visibleTasks = null
        if(this.state.showDoneTasks) {
            visibleTasks = [...this.state.tasks]
        } else {
            const pending = (task: any) => task.doneAt === null
            visibleTasks = this.state.tasks.filter(pending)
        }
        this.setState({ visibleTasks })
        AsyncStorage.setItem('tasksState', JSON.stringify(this.state))
    }

    toggleTask = (taskId: any) => {
        const tasks = [...this.state.tasks]
        tasks.forEach(task => {
            if(task.id === taskId) {
                task.doneAt = task.doneAt ? null : new Date()
            }
        })
        this.setState({ tasks: tasks }, this.filterTasks)
    }

    addTask = (newTask: { desc: string; date: Date | null }) => {
        if(!newTask.desc || !newTask.desc.trim()) {
            return
        }
        const tasks = [...this.state.tasks]
        tasks.push({
            id: Math.random(),
            desc: newTask.desc,
            estimateAt: newTask.date,
            doneAt: null
        })
        this.setState({ tasks, showAddTask: false }, this.filterTasks)
    }

    deleteTask = (taskId: any) => {
        const tasks = this.state.tasks.filter(task => task.id !== taskId)
        this.setState({ tasks }, this.filterTasks)
    }

    render() {
        const today = moment().locale('pt-br').format('ddd, D [de] MMMM')
        return (
            <GestureHandlerRootView style={styles.container}>
                <AddTask isVisible={this.state.showAddTask} onCancel={() => this.setState({ showAddTask: false })} onSave={this.addTask} />
                <ImageBackground source={todayImage} style={styles.background}>
                    <View style={styles.iconBar}>
                        <TouchableOpacity onPress={this.toggleFilter}>
                            <Icon name={this.state.showDoneTasks ? "eye-slash" : "eye"} size={20} color={commonStyles.colors.secondary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.titleBar}>
                        <Text style={styles.title}>Hoje</Text>
                        <Text style={styles.subTitle}>{today}</Text>
                    </View>
                </ImageBackground>
                <View style={styles.taskList}>
                    <FlatList 
                        data={this.state.visibleTasks}
                        keyExtractor={item => `${item.id}`}
                        renderItem={({ item }) => <Task {...item} onToggleTask={this.toggleTask} onDelete={this.deleteTask} />}
                    />
                </View>
                <TouchableOpacity onPress={() => this.setState({ showAddTask: true })} style={styles.addButton} activeOpacity={0.7}>
                    <Icon name="plus" size={20} color={commonStyles.colors.secondary} />
                </TouchableOpacity>
            </GestureHandlerRootView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    background: {
        flex: 3
    },
    taskList: {
        flex: 7,
    },
    titleBar: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    title: {
        fontFamily: commonStyles.fontFamily,
        fontSize: 50,
        color: commonStyles.colors.secondary,
        marginLeft: 20,
        marginBottom: 20
    },
    subTitle: {
        fontFamily: commonStyles.fontFamily,
        fontSize: 20,
        color: commonStyles.colors.secondary,
        marginLeft: 20,
        marginBottom: 30
    },
    iconBar: {
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'flex-end',
        marginTop: Platform.OS === 'ios' ? 40 : 25
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: commonStyles.colors.today,
        justifyContent: 'center',
        alignItems: 'center'
    }
})