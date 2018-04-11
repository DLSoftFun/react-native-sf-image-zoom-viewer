import React, {Component} from "react";
import {
    StyleSheet,
    Image,
    Dimensions,
    View,
    TouchableWithoutFeedback
} from "react-native";
import PropTypes from 'prop-types'
import SFZoomViewConfig from './SFZoomViewConfig'
import SFZoomBigImage from'./tool/SFZoomBigImage'
import SFZoomVideo from './tool/SFZoomVideo'
export default class SFZoomImageButton extends Component {

    constructor(props) {
        super(props)

        this.state = {

        }
    }
    static propTypes = {
        imgData: PropTypes.object.isRequired,
        cropWidth: PropTypes.number.isRequired,
        cropHeight: PropTypes.number.isRequired,
    }
    componentDidMount(){

    }

    clickVideo = () => {
        this.refVideo.show(this.props.imgData.video_path);
    }
    clickBigImage = () => {
        this.refBigImage.show(this.props.imgData.big_path);
    }
    render_buttons = () => {
        if (this.props.imgData.type == SFZoomViewConfig.ZOOM_TYPE_VIDEO){
            return(
                <TouchableWithoutFeedback onPress={this.clickVideo}>
                    <Image source={require('./img/play.png')} style={{
                        width:80,
                        height:80,
                    }}></Image>
                </TouchableWithoutFeedback>

            )
        }else if (this.props.imgData.type == SFZoomViewConfig.ZOOM_TYPE_LONG_IMG){
            return(
                <TouchableWithoutFeedback onPress={this.clickBigImage}>
                    <Image source={require('./img/big.png')} style={{
                        width:80,
                        height:80,
                    }}></Image>
                </TouchableWithoutFeedback>
            )
        }else{
            return null
        }
    }
    render() {
        if (this.props.imgData.type == SFZoomViewConfig.ZOOM_TYPE_VIDEO ||
            this.props.imgData.type == SFZoomViewConfig.ZOOM_TYPE_LONG_IMG){
            return(
                <View style={{
                    width:80,
                    height:80,
                    position:'absolute',
                    left:(this.props.cropWidth-80)/2,
                    top:(this.props.cropHeight-80)/2
                }}>
                    {this.render_buttons()}
                    <SFZoomBigImage ref={(ref) => {this.refBigImage = ref}}/>
                    <SFZoomVideo ref={(ref) => {this.refVideo = ref}}/>
                </View>
            )
        }
        return null


    }

}