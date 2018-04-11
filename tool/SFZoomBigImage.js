import React, {Component} from "react";
import {
    StyleSheet,
    Image,
    Dimensions,
    View,
    TouchableWithoutFeedback,
    ScrollView,
    Modal,
} from "react-native";
import SFZoomImageCache from '../SFZoomImageCache'
import resolveAssetSource from 'resolveAssetSource';

var dw = Dimensions.get('window').width;
var dh = Dimensions.get('window').height;
export default class SFZoomBigImage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            path:'',
            visible:false,
            width:0,
            height:0
        }
    }
    componentWillMount(){

    }
    show = (path) => {
        this.setState({
            visible:true,
            path:path
        })
        if (typeof(path)=='string'){
            Image.getSize(path,(width,height)=>{
                this.setState({
                    width:dw,
                    height:height*dw/width
                })
            })
        }else{
            let source = resolveAssetSource(path)
            this.setState({
                width:dw,
                height:source.height*dw/source.width
            })
        }

    }
    onTouchStart = (evt) =>{
        this.lastTapTime = new Date().getTime()
        this.lastPageX = evt.nativeEvent.pageX;
        this.lastPageY = evt.nativeEvent.pageY;
    }
    onTouchEnd = (evt) => {
        const stayTime = new Date().getTime() - this.lastTapTime;
        const moveDistance = Math.sqrt((evt.nativeEvent.pageX-this.lastPageX)*(evt.nativeEvent.pageX-this.lastPageX)+(evt.nativeEvent.pageY-this.lastPageY)*(evt.nativeEvent.pageY-this.lastPageY))
        if (evt.nativeEvent.changedTouches.length <= 1 && stayTime < 300 && moveDistance < 10) {
            this.setState({
                visible:false
            })
        }
    }
    render() {
        var imgSrc = this.state.path;
        if (typeof(this.state.path)=='string'){//网络图片
            imgSrc = {uri:this.state.path}
        }else {//本地图片

        }
        return (
            <Modal
                animationType="fade"
                visible={this.state.visible}
            >
                <ScrollView
                    maximumZoomScale={4.0}    // 子组件(图片)放大倍数
                    minimumZoomScale={1.0}  // 子组件(图片)缩小倍数
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={true}
                    centerContent={false} // 子组件(图片)一直处于父组件中心位置,不会因缩放向其他方向偏离
                    style={{
                        backgroundColor:'black',
                        width:dw,
                        height:dh,}}
                    onTouchStart={this.onTouchStart}
                    onTouchEnd={this.onTouchEnd}
                >
                    <Image source={imgSrc} style={{
                        width:this.state.width,
                        height:this.state.height
                    }}></Image>
                </ScrollView>
            </Modal>
        )
    }

}