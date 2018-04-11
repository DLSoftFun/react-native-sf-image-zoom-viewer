import React, {Component} from "react";
import {
    StyleSheet,
    Image,
    Dimensions,
    View,
    TouchableWithoutFeedback,
    Animated
} from "react-native";
import PropTypes from 'prop-types'
import SFZoomViewConfig from './SFZoomViewConfig'
export default class SFZoomShowAnimated extends Component {

    constructor(props) {
        super(props)

        this.state = {
            isShow:false
        }
    }
    static propTypes = {
        cropWidth: PropTypes.number.isRequired,
        cropHeight: PropTypes.number.isRequired,
        onShowBegin: PropTypes.func.isRequired,
        onShowEnd: PropTypes.func.isRequired,
    }
    hide = () => {
        this.setState({
            isShow:false
        })
    }
    init = (imgPath,x,y,w,h,isFadeIn) =>{
        this.imgPath = imgPath;
        this.aniPrePosX = new Animated.Value(x);
        this.aniPrePosY = new Animated.Value(y);
        this.aniPreWidth = new Animated.Value(w);
        this.aniPreHeight = new Animated.Value(h);
        this.isFadeIn = isFadeIn;
    }
    show = (toX,toY,toW,toH) => {
        var toOpacity = 0;
        if (this.isFadeIn){
            this.aniPreOpacity = new  Animated.Value(0);
            toOpacity = 1;
        }else{
            this.aniPreOpacity = new  Animated.Value(1);
            toOpacity = 0;
        }
        this.aniPrePosX.stopAnimation();
        this.aniPrePosY.stopAnimation();
        this.aniPreWidth.stopAnimation()
        this.aniPreHeight.stopAnimation()
        this.aniPreOpacity.stopAnimation()
        this.setState({
            isShow:true
        },()=>{
            this.props.onShowBegin(this.isFadeIn);
            Animated.parallel([
                Animated.timing(this.aniPrePosX, {
                    toValue: toX,
                    duration: SFZoomViewConfig.show_duration,
                }).start(),
                Animated.timing(this.aniPrePosY, {
                    toValue: toY,
                    duration: SFZoomViewConfig.show_duration,
                }).start(),
                Animated.timing(this.aniPreWidth, {
                    toValue: toW,
                    duration: SFZoomViewConfig.show_duration,
                }).start(),
                Animated.timing(this.aniPreHeight, {
                    toValue: toH,
                    duration: SFZoomViewConfig.show_duration,
                }).start(),
                Animated.timing(this.aniPreOpacity, {
                    toValue: toOpacity,
                    duration: SFZoomViewConfig.show_duration,
                }).start(()=>{
                    this.props.onShowEnd(this.isFadeIn);
                })
            ]).start()

        })

    }

    componentWillMount(){

    }
    componentDidMount(){

    }

    render() {
            var imgSrc,opacity;
            if (this.state.isShow){
                opacity = 1;
            }else{
                opacity = 0;
            }
            if (typeof(this.imgPath) == 'string'){
                imgSrc = {uri:this.imgPath}
            }else{
                imgSrc = this.imgPath;
            }
            return(
                <View style={{
                    width:this.props.cropWidth,
                    height:this.props.cropHeight,
                    position:'absolute',
                    left:0,
                    top:0,
                    opacity:opacity,
                    backgroundColor:'transparent'
                }}>
                    <Animated.View style={{
                        width:this.props.cropWidth,
                        height:this.props.cropHeight,
                        position:'absolute',
                        left:0,
                        top:0,
                        backgroundColor:'black',
                        opacity:this.aniPreOpacity
                    }}></Animated.View>
                    <Animated.Image
                        source={imgSrc}
                        style={{
                            width:this.aniPreWidth,
                            height:this.aniPreHeight,
                            position:'absolute',
                            left:this.aniPrePosX,
                            top:this.aniPrePosY
                        }}>
                    </Animated.Image>


                </View>
            )
    }

}