/**
 * Created by rw on 2018/4/7
 * Desc:多图查看器，包括放大缩小，视频、长图查看。提供显示和隐藏动画
 *
 * 第三方库安装
 * npm install react-native-md5
 * npm install react-native-video
 * react-native link react-native-video
 */
import React, {Component} from "react";
import {
    StyleSheet,
    Image,
    Dimensions,
    View,
    TouchableWithoutFeedback,
    ScrollView,
    Text,
    PanResponder,
    Animated,
} from "react-native";
import PropTypes from 'prop-types'

import SFZoomImage from './SFZoomImage'
import SFZoomViewConfig from './SFZoomViewConfig'
import SFZoomViewHeader from './SFZoomViewHeader'
import SFZoomImageButton from './SFZoomImageButton'
var dw = Dimensions.get('window').width;
var dh = Dimensions.get('window').height;
export default class SFZoomView extends Component {

    constructor(props) {
        super(props)
        this.state=({
            curIndex:0,
            maxIndex:0,
            dataSource:[],
            firstIndex:0,
            isShow:false
        })
    }
    /**
     * @param isShowAni 是否显示图片放大动画
     * @param isShowShare 是否显示分享按钮
     * @param onShare 分享按钮点击⌚️ 参数：index
     * */
    static propTypes = {
        isShowAni: PropTypes.bool,
        isShowShare: PropTypes.bool,
        onShare: PropTypes.func,
    }
    static defaultProps = {
        isShowAni: true,
        isShowShare:true
    };
    /**
     * @param data
     *        图片类型参考： SFZoomViewConfig
     *        ctrHandel：通过findNodeHandle获取小图的句柄
     *        当需要显示动画时：[{big_path:'http://...',small_path:'',type:0,ctrHandel:handel},
                             {big_path:require('...'),small_path:'',type:0,ctrHandel:handel},
                             {big_path:'http://...',small_path:'',type:1,ctrHandel:handel,video_path:''}]
              不需要显示动画时：[{big_path:'http://...',small_path:'',type:0},
                             {big_path:require('...'),small_path:'',type:0},
                             {big_path:'http://...',small_path:'',type:1,video_path:''}]
     * @param showIndex 当前显示的索引
     * */
    init = (data) => {
        this.setState({
            maxIndex:data.length,
            dataSource:data,
        })
    }
    show = (showIndex) => {
        this.setState({
            curIndex:showIndex,
            firstIndex:showIndex,
            isShow:true,
        },()=>{
            var zoomImage = this.refs['zoom_img_'+this.state.curIndex];
            zoomImage.showZoomFadeIn();
            this.scrollToIndex(showIndex,false)
        })
    }
    onAniZoomBegin = (isFadeIn) => {
        if (isFadeIn){
            this.aniOpacity.setValue(0)
        }else{
            this.aniOpacity.setValue(0)
        }
    }
    onAniZoomEnd = (isFadeIn) => {
        if (isFadeIn){
            this.aniOpacity.setValue(1)
        }else{

            this.aniOpacity.setValue(0)
        }
    }
    scrollToIndex = (index,animated) => {
        if (index >= 0 && index < this.state.maxIndex){
            this.posX = -(dw+SFZoomViewConfig.img_dis)*(index);
            if (animated){
                Animated.timing(this.aniPosX, {
                    toValue: this.posX,
                    duration: 100,
                }).start()
            }else{
                this.aniPosX.setValue(this.posX)
            }

        }
    }
    onNext = (index) => {
        if (index+1 < this.state.maxIndex){
            this.posX = -(dw+SFZoomViewConfig.img_dis)*(index+1);
            Animated.timing(this.aniPosX, {
                toValue: this.posX,
                duration: 100,
            }).start()
            this.setState({curIndex:index+1})
            return true
        }else{
            this.onRecover(index);
            return false
        }
    }
    onLast = (index) => {
        if (index-1 >= 0){
            this.posX = -(dw+SFZoomViewConfig.img_dis)*(index-1);
            Animated.timing(this.aniPosX, {
                toValue: this.posX,
                duration: 100,
            }).start()
            this.setState({curIndex:index-1})
            return true
        }else{
            this.onRecover(index);
            return false
        }
    }
    onRecover = (index,animated = true) => {
        this.posX = -(dw+SFZoomViewConfig.img_dis)*index;
        if (animated){
            Animated.timing(this.aniPosX, {
                toValue: this.posX,
                duration: 100,
            }).start()
        }else{
            this.aniPosX.setValue(this.posX);
        }

    }
    onHide = () => {
        this.setState({
            isShow:false
        })
    }
    onShare = (index) => {
        if (this.props.onShare){
            this.props.onShare(index)
        }
    }
    onHorizontalOuter = (index,diff) => {
        this.posX = -(dw+SFZoomViewConfig.img_dis)*index+diff;
        if (index == 0){
            if (this.posX >= 20){
                this.posX = 20;
            }
        }else if (index == this.state.maxIndex-1){
            if (this.posX < -(dw+SFZoomViewConfig.img_dis)*index-20){
                this.posX = -(dw+SFZoomViewConfig.img_dis)*index-20
            }
        }

        this.aniPosX.setValue(this.posX);
    }


    render_imgs = () => {
        var imgs = [];
        for (var i = 0; i < this.state.dataSource.length;i++){
            var left = SFZoomViewConfig.img_dis;
            if (i == 0){
                left = 0;
            }
            imgs.push(
                <View key={i} style={{
                    width:dw,
                    height:dh,
                    marginLeft:left,
                    backgroundColor:'transparent',
                }}>
                    <SFZoomImage
                        ref={'zoom_img_'+i}
                        key={i}
                        index={i}
                        firstIndex={this.state.firstIndex}
                        imgData={this.state.dataSource[i]}
                        cropWidth={dw}
                        cropHeight={dh}
                        onNext={this.onNext}
                        onLast={this.onLast}
                        onRecover={this.onRecover}
                        onHorizontalOuter={this.onHorizontalOuter}
                        onHide={this.onHide}
                        onAniZoomBegin={this.onAniZoomBegin}
                        onAniZoomEnd={this.onAniZoomEnd}
                    />

                    <SFZoomImageButton ref={(ref)=>{this.zoomButton = ref}} cropWidth={dw} cropHeight={dh} imgData={this.state.dataSource[i]}/>
                </View>
            )
        }
        return imgs;
    }

    render() {
        if (this.state.dataSource.length > 0 && this.state.isShow){
            return (
                <Animated.View style={{
                    flex:1,
                    backgroundColor:'transparent',
                    position:'absolute',
                    left:0,
                    top:0,
                }}>
                    <Animated.View style={{
                        width:dw,
                        height:dh,
                        backgroundColor:'black',
                        opacity:this.aniOpacity,
                        position:'absolute',
                        left:0,
                        top:0
                    }}>

                    </Animated.View>
                    <Animated.View
                        style={{
                            flexDirection:'row',
                            height:dh,
                            width:(dw+SFZoomViewConfig.img_dis)*this.state.maxIndex,
                            transform:[{translateX:this.aniPosX}],
                            alignItems:'center',
                            backgroundColor:'transparent'
                        }}
                    >
                        {this.render_imgs()}
                    </Animated.View>


                    <SFZoomViewHeader cropWidth={dw} curIndex={this.state.curIndex} maxIndex={this.state.maxIndex} onShare={this.onShare}></SFZoomViewHeader>
                </Animated.View>
            )
        }else{
            return null;
        }

    }
    config = () => {
            SFZoomViewConfig.is_show_share = this.props.isShowShare;
            SFZoomViewConfig.is_show_ani = this.props.isShowAni;
    }
    componentWillMount() {
        this.posX = 0;
        this.lastPosX = 0;
        this.aniPosX = new Animated.Value(this.posX);
        this.aniOpacity = new Animated.Value(0);

        this.config()
    }

    componentDidMount(){

    }



}

const styles = StyleSheet.create(

)
