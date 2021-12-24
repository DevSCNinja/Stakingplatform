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
import CRCUnStake from "../../ABI/CRCUnStake.json";
const CrocosUnstake = "0x276d8E6A06f627611389dCb44bF1F3B277F72C09"
let myAddr = "";
const netchainId = 25;
const netchainIdHex = '0x19';
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
    const [stakeBalance, setStakeBalance] = useState(0);
    const [stakeWithBal, setStakeWithBal] = useState(0);

    const onClickStake = async () => {
        if (stakeWithBal && stakeWithBal > 0) {
            const web3 = new Web3(Web3.givenProvider);
            let crcUnstakeContract;
            try {
                const chainId = await web3.eth.getChainId()
                if (chainId === netchainId) {
                    const web3Modal = new Web3Modal();
                    const connection = await web3Modal.connect();
                    const provider = new ethers.providers.Web3Provider(connection);
                    const signer = provider.getSigner();
                    crcUnstakeContract = new ethers.Contract(
                        CrocosUnstake,
                        CRCUnStake.abi,
                        signer
                    );
                    const farmCon = await crcUnstakeContract.withdrawStakedCRC();
                    await farmCon.wait();
                    setOpen(false)
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

    const onClickWithdraw = async () => {
        setStakeWithBal(0);

        const web3 = new Web3(Web3.givenProvider);
        let crcUnstakeContract;
        try {
            const chainId = await web3.eth.getChainId()
            if (chainId === netchainId) {
                const web3Modal = new Web3Modal();
                const connection = await web3Modal.connect();
                const provider = new ethers.providers.Web3Provider(connection);
                const signer = provider.getSigner();
                myAddr = signer.provider.provider.selectedAddress;
                console.log(myAddr)
                crcUnstakeContract = new ethers.Contract(
                    CrocosUnstake,
                    CRCUnStake.abi,
                    signer
                );
                const val = await crcUnstakeContract.getClaimableCRCBalanceOf(myAddr);
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
                <img src={getImg('home/ft.png')} style={{ height: '180px', marginBottom: '20px' }} alt="nft" />
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
                            <h3>Balance {Math.trunc(stakeBalance / (10 ** 13)) / 100000}</h3>
                            <input type="number"
                                onChange={(e) => {
                                    setStakeWithBal(e.target.value)
                                    if (e.target.value < 0) e.target.value = 0
                                }} />
                        </div>
                        <CustomButton value="Withdraw" onClick={onClickStake} style={{ float: 'right', margin: '0 50px 20px 0', width: 150 }} />
                    </Box>
                </Fade>
            </Modal>
        </div>
    )
}