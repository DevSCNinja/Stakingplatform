import React from "react";
import { useState, useEffect } from 'react'
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { ethers } from 'ethers'
import Web3 from 'web3'
import Web3Modal from "web3modal";
import { getImg } from "../../hook/Helper";
import styles from './Home.module.sass';
import { CustomButton } from "../../components/CustomButton";
import CrocosFarmCont from "../../ABI/CrocosFarm.json";
import CrocosTokenCont from '../../ABI/CrocosToken.json';
const CrocosFarmAddr = "0xa7F25Ecf449a498A7F41112f35B6e1EE2dc1a4f7";
const CrocosTokenAddr = "0xfbb5B537625f210F7A36E2522e5E91a7F00C9e96";
let myAddr = "";
const netchainId = 25;
const netchainIdHex = '0x152';
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
};

export const CardNum = () => {
    const [open, setOpen] = useState(false);
    const [stakeState, setStakeState] = useState(false);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [stakeBalance, setStakeBalance] = useState(0);
    const [harvest, setHarvest] = useState(0);
    const [stakeWithBal, setStakeWithBal] = useState(0);
    const onClickStake = async () => {
        if (stakeWithBal && stakeWithBal > 0) {
            const web3 = new Web3(Web3.givenProvider);
            let farmContract;
            let tokenContract;
            try {
                const chainId = await web3.eth.getChainId()
                if (chainId === netchainId) {
                    const web3Modal = new Web3Modal();
                    const connection = await web3Modal.connect();
                    const provider = new ethers.providers.Web3Provider(connection);
                    const signer = provider.getSigner();
                    farmContract = new ethers.Contract(
                        CrocosFarmAddr,
                        CrocosFarmCont.abi,
                        signer
                    );
                    tokenContract = new ethers.Contract(
                        CrocosTokenAddr,
                        CrocosTokenCont.abi,
                        signer
                    );
                    const sendToken = stakeWithBal + '000000000000000000';
                    if (stakeState === true) {
                        const getAllowance = await tokenContract.allowance(myAddr, CrocosFarmAddr);
                        if(getAllowance / Math.pow(10, 18) < stakeWithBal) {
                          const tokenCon = await tokenContract.approve(CrocosFarmAddr, ('1000000000000000000000000'));                          
                          await tokenCon.wait();
                        }                      
                        
                        console.log('sendToken', sendToken)
                        const farmCon = await farmContract.stakeFt(sendToken);
                        await farmCon.wait();
                        setOpen(false)
                    } else {
                        const farmCon = await farmContract.withdrawFt(sendToken);
                        await farmCon.wait();
                        setOpen(false)
                    }
                } else {
                    try {
                        await web3.currentProvider.request({
                            method: "wallet_switchEthereumChain",
                            params: [{ chainId: netchainIdHex }]
                        });
                    } catch (error) {
                        console.log(error.message);
                    }
                }
            } catch (err) {
                console.log(err)
            }
        } else {
            alert('please insert stake or withdraw value')
        }

    }
    useEffect(() => {

        const timer = setInterval(async () => {
            const web3 = new Web3(Web3.givenProvider);
            let farmContract;
            try {
                const chainId = await web3.eth.getChainId()
                const web3Modal = new Web3Modal();
                const connection = await web3Modal.connect();
                const provider = new ethers.providers.Web3Provider(connection);
                const signer = provider.getSigner();
                myAddr = signer.provider.provider.selectedAddress;
                farmContract = new ethers.Contract(
                    CrocosFarmAddr,
                    CrocosFarmCont.abi,
                    signer
                );
                if (chainId === netchainId) {
                    const reward = (await farmContract.getTotalClaimableFt(myAddr) / Math.pow(10, 18)).toString().slice(0, 7);
                    setHarvest(reward);

                } else {
                    clearInterval(timer)
                }
            } catch (err) {
                console.log(err)
            }
        }, 3000)
    }, [])

    const onClickPick = async () => {
        setStakeState(true);
        setStakeWithBal(0)
        const web3 = new Web3(Web3.givenProvider);
        let tokenContract;
        try {
            const chainId = await web3.eth.getChainId()
            if (chainId === netchainId) {
                const web3Modal = new Web3Modal();
                const connection = await web3Modal.connect();
                const provider = new ethers.providers.Web3Provider(connection);
                const signer = provider.getSigner();
                myAddr = signer.provider.provider.selectedAddress;
                console.log(myAddr)
                tokenContract = new ethers.Contract(
                    CrocosTokenAddr,
                    CrocosTokenCont.abi,
                    provider
                );
                // const balance = await nftContract.balanceOf(myAddr);
                const currentValue = await tokenContract.balanceOf(myAddr);
                setCurrentBalance(currentValue - 0)
                console.log(currentValue)
                setOpen(true)
            } else {
                try {
                    const switchChain = await web3.currentProvider.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: netchainIdHex }]
                    });
                    await switchChain.wait()
                } catch (error) {
                    console.log(error.message);
                }
            }
        } catch (err) {
            console.log(err)
        }

    }

    const onClickHarvest = async () => {
        console.log('clicked')
        const web3 = new Web3(Web3.givenProvider);
        let farmContract;
        try {
            const chainId = await web3.eth.getChainId()
            if (chainId === netchainId) {
                const web3Modal = new Web3Modal();
                const connection = await web3Modal.connect();
                const provider = new ethers.providers.Web3Provider(connection);
                const signer = provider.getSigner();
                myAddr = signer.provider.provider.selectedAddress;
                console.log(myAddr)
                farmContract = new ethers.Contract(
                    CrocosFarmAddr,
                    CrocosFarmCont.abi,
                    signer
                );
                if (harvest > 0) {
                    await farmContract.harvestFt();
                }
            } else {
                try {
                    await web3.currentProvider.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: netchainIdHex }]
                    });
                } catch (error) {
                    console.log(error.message);
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    const onClickWithdraw = async () => {
        setStakeState(false);
        setStakeWithBal(0);

        const web3 = new Web3(Web3.givenProvider);
        let farmContract;
        let nftContract;
        try {
            const chainId = await web3.eth.getChainId()
            if (chainId === netchainId) {
                const web3Modal = new Web3Modal();
                const connection = await web3Modal.connect();
                const provider = new ethers.providers.Web3Provider(connection);
                const signer = provider.getSigner();
                myAddr = signer.provider.provider.selectedAddress;
                console.log(myAddr)
                farmContract = new ethers.Contract(
                    CrocosFarmAddr,
                    CrocosFarmCont.abi,
                    signer
                );
                const val = await farmContract.stakeBalancesFt(myAddr);
                setStakeBalance(val);
                setOpen(true)
            } else {
                try {
                    await web3.currentProvider.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: netchainIdHex }]
                    });
                } catch (error) {
                    console.log(error.message);
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div>
            <div className={styles.card}>
                <div className={styles.title}>Stake CROCOS get CROCOS 50% APR</div>
                <img src={getImg('home/ft.png')}  style={{height:'180px'}} alt="nft" />
                <CustomButton value="Pick CROCOS" onClick={onClickPick} />
                <div className={styles.box}>
                    <h5>Reward</h5>
                    <p>{harvest} CROCOS</p>
                    <CustomButton value="Harvest" onClick={onClickHarvest} />
                </div>
                <CustomButton value="Withdraw" onClick={onClickWithdraw} />
            </div>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={open}>
                    <Box sx={style}>
                        <div className={styles.unmber}>
                            <h3>Balance {stakeState ? Math.trunc(currentBalance / (10 ** 13)) / 100000 : Math.trunc(stakeBalance / (10 ** 13)) / 100000}</h3>
                            <input type="number"
                                onChange={(e) => {
                                    setStakeWithBal(e.target.value)
                                    if (e.target.value < 0) e.target.value = 0
                                }} />
                        </div>
                        <CustomButton value={stakeState ? "Stake" : "Withdraw"} onClick={onClickStake} style={{ float: 'right', margin: '0 50px 20px 0', width: 150 }} />
                    </Box>
                </Fade>
            </Modal>
        </div>
    )
}