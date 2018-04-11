import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    Image,
    Animated,
    Dimensions,
    Modal,
    Slider,
    ActivityIndicator
} from 'react-native';
import Video from 'react-native-video';
var dw = Dimensions.get('window').width;
var dh = Dimensions.get('window').height;

const btnPlay = require('./img/play.png');
const btnPause = require('./img/pause.png');
const thumbImage = require('./img/thumbImage.png');
const btnClose = require('./img/close.png');
export default class SFZoomVideo extends Component {

    constructor(props) {
        super(props);
        this.state = ({
            isVisible:false,
            isPause:true,
            source:'',
            isShowTool:false,
            sliderValue:0,
            curTimer:0,
            maxTimer:0
        })
    }

    componentDidMount(){

    }

    componentWillUnmount(){
        this.timer && clearTimeout(this.timer);
    }

    show = (url) => {
        this.setState({isVisible:true,isPause:false,source:url},()=>{
            //this.player.presentFullscreenPlayer()
            //this.player.seek(0)
        })
    }

    hide = () =>{
        this.setState({isVisible:false});
    }

    onEnd = () => {

    }

    onBuffer = () =>{

    }

    setTime = (timer) => {
        var curTime =  Math.round(timer.currentTime);
        var totalTime =  Math.round(timer.seekableDuration);
        if (this.state.maxTimer == 0){
            this.setState({maxTimer:totalTime})
        }

        this.setState({
            curTimer:curTime,
            sliderValue:curTime*100/totalTime
        })
    }

    videoError = (error) => {
        //this.toast.show('视频解析失败');
    }

    getTimerStr = (sec) =>{
        var m = Math.floor(sec/60);
        var s = sec%60;
        if (m < 10){
            m = '0' + m;
        }
        if (s < 10){
            s = '0' + s;
        }
        return m + ':' + s;
    }
    onTimedMetadata = () =>{

    }
    sliderValueChange = (value) =>{
        this.setState({
            isPause:true
        })
        this.unMountTimer();

    }
    sliderChangeFinsih = (value) =>{
        var timer = value*this.state.maxTimer/100;
        this.player.seek(timer);
        this.setState({
            isPause:false
        })
        this.mountTimer();
    }
    renderVideo() {
        if (this.state.source != ''){
            return(
                <Video source={{uri: this.state.source}}   // Can be a URL or a local file.
                       ref={(ref) => {
                           this.player = ref
                       }}                                      // Store reference
                       rate={1.0}                              // 0 is paused, 1 is normal.
                       volume={1.0}                            // 0 is muted, 1 is normal.
                       muted={false}                           // Mutes the audio entirely.
                       paused={this.state.isPause}                          // Pauses playback entirely.
                    //resizeMode="cover"                      // Fill the whole screen at aspect ratio.*
                       repeat={true}                           // Repeat forever.
                       playInBackground={false}                // Audio continues to play when app entering background.
                       playWhenInactive={false}                // [iOS] Video continues to play when control or notification center are shown.
                       ignoreSilentSwitch={"ignore"}           // [iOS] ignore | obey - When 'ignore', audio will still play with the iOS hard silent switch set to silent. When 'obey', audio will toggle with the switch. When not specified, will inherit audio settings as usual.
                       progressUpdateInterval={250.0}          // [iOS] Interval to fire onProgress (default to ~250ms)
                       onProgress={this.setTime}               // Callback every ~250ms with currentTime
                       onEnd={this.onEnd}                      // Callback when playback finishes
                       onError={this.videoError}               // Callback when video cannot be loaded
                       onBuffer={this.onBuffer}                // Callback when remote video is buffering
                    //onTimedMetadata={this.onTimedMetadata}  // Callback when the stream receive some metadata
                       style={styles.backgroundVideo}
                />
            )
        }else{
            return null;
        }
    }
    clickPlay = () => {
        if (this.state.isPause){
            this.setState({
                isPause:false,
                isShowTool:false
            })
        }else{
            this.setState({
                isPause:true
            })
            this.unMountTimer();
        }

    }
    clickBg = () => {
        this.unMountTimer();
        if (this.state.isShowTool){
            this.setState({isShowTool:false})
        }else{
            this.setState({isShowTool:true})
            this.mountTimer();
        }
    }
    clickClose = () => {
        this.unMountTimer();
        this.setState({
            isPause:true,
            isVisible:false,
            curTimer:0,
            maxTimer:0,
            isShowTool:false,
            sliderValue:0
        })
    }
    mountTimer = () => {
        var _this = this;
        this.timer = setTimeout(()=>{
            _this.setState({isShowTool:false})
        },1500);
    }
    unMountTimer = () => {
        this.timer && clearTimeout(this.timer);
    }
    renderFooter = () => {
        if (this.state.isShowTool){
            return(
                <View style={{
                    position:'absolute',
                    height:30,
                    bottom:0,
                    left:0,
                    flexDirection:'row',
                    alignItems:'center'
                }}>
                    <Text style={{
                        backgroundColor:'transparent',
                        color:'white',
                        fontSize:13,
                        width:50,
                        marginLeft:10
                    }}>{this.getTimerStr(this.state.curTimer)}</Text>
                    <Slider style={{
                        height: 10,
                        width:dw-120
                    }}
                            thumbImage={thumbImage}
                            maximumValue={100}
                            minimumTrackTintColor='white'
                            value={this.state.sliderValue}
                            onValueChange={this.sliderValueChange}
                            onSlidingComplete={this.sliderChangeFinsih}
                    />
                    <Text style={{
                        backgroundColor:'transparent',
                        color:'white',
                        fontSize:13,
                        width:50,
                        marginRight:10,
                        textAlign:'right'
                    }}>{this.getTimerStr(this.state.maxTimer)}</Text>
                </View>
            )
        }else{
            return null;
        }

    }
    renderPlayButton = () => {
        var source = btnPause;
        if (this.state.isPause){
            source = btnPlay;
        }
        if (this.state.isShowTool){
            return(
                <TouchableWithoutFeedback onPress={this.clickPlay}>
                    <Image style={{
                        width:50,
                        height:50
                    }} source={source}></Image>
                </TouchableWithoutFeedback>

            )
        }else{
            return null;
        }

    }
    render() {
        if (this.state.isVisible){
            return (

                <Modal
                    animationType='fade'
                    transparent={true}
                    visible={this.state.isVisible}
                >
                    <TouchableWithoutFeedback onPress={this.clickBg}>
                        <View style={{
                            width:dw,
                            height:dh,
                            justifyContent:'center',
                            alignItems:'center',
                            backgroundColor:'rgba(0,0,0,0.9)'
                        }}>
                            <View style={{width:dw,height:300,backgroundColor:'red',alignItems:'center',justifyContent:'center'}}>
                                {this.renderVideo()}
                                {this.renderPlayButton()}
                                {this.renderFooter()}
                            </View>
                            <TouchableWithoutFeedback onPress={this.clickClose}>
                                <Image style={{
                                    position:'absolute',
                                    right:10,
                                    top:30
                                }} source={btnClose}></Image>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

            )
        }else{
            return null;
        }

    }

}
const styles = StyleSheet.create({
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
})
